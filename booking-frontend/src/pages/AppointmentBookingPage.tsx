"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes } from "date-fns";
import apiService from "../services/api";

interface TimeSlot {
  time: string;
  available: boolean;
  provider: string;
  providerId: string;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  speciality?: string;
}

const appointmentTypes = [
  { value: "checkup", label: "Regular Checkup", duration: 30 },
  { value: "cleaning", label: "Dental Cleaning", duration: 45 },
  { value: "filling", label: "Filling", duration: 60 },
  { value: "root_canal", label: "Root Canal", duration: 90 },
  { value: "extraction", label: "Tooth Extraction", duration: 45 },
  { value: "consultation", label: "Consultation", duration: 30 },
  { value: "emergency", label: "Emergency", duration: 60 },
  { value: "other", label: "Other", duration: 30 },
];

const steps = [
  { id: "personal", title: "Personal Info" },
  { id: "appointment", title: "Appointment Details" },
  { id: "confirmation", title: "Confirmation" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export default function AppointmentBookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Appointment Details
  const [appointmentType, setAppointmentType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Available slots and providers
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate]);

  const loadProviders = async () => {
    try {
      const response = await apiService.get("/providers");
      if (response.data && response.data.length > 0) {
        setProviders(response.data);
      } else {
        setError("No providers available. Please contact the clinic.");
      }
    } catch (err: any) {
      console.error("Failed to load providers:", err);
      setError("Failed to load providers. Please refresh the page or contact the clinic.");
    }
  };

  const loadTimeSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      
      if (!providers || providers.length === 0) {
        setError("No providers available. Please contact the clinic to book an appointment.");
        setTimeSlots([]);
        return;
      }

      const response = await apiService.get("/appointments", { params: { date } });
      const existingAppointments = response.data || [];

      const slots: TimeSlot[] = [];
      const baseDate = new Date(date);
      const now = new Date();
      const isToday = format(baseDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");

      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = setMinutes(setHours(baseDate, hour), minute);
          const timeString = format(slotTime, "HH:mm");
          const isoString = slotTime.toISOString();

          if (isToday && slotTime <= now) {
            continue;
          }

          const isTaken = existingAppointments.some((apt: any) => {
            const aptTime = format(new Date(apt.scheduledTime), "HH:mm");
            return aptTime === timeString && apt.status !== "CANCELLED";
          });

          const providerIndex = slots.length % providers.length;
          const provider = providers[providerIndex];

          slots.push({
            time: isoString,
            available: !isTaken,
            provider: `Dr. ${provider.firstName} ${provider.lastName}`,
            providerId: provider.id,
          });
        }
      }

      setTimeSlots(slots);
    } catch (err: any) {
      console.error("Failed to load time slots:", err);
      setError(err.response?.data?.message || "Failed to load available time slots. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!firstName || !lastName || !phone) {
        setError("Please fill in all required fields");
        toast.error("Please fill in all required fields");
        return;
      }
      if (phone && !phone.match(/^\+?[1-9]\d{1,14}$/)) {
        setError("Please enter a valid phone number (e.g., +1234567890)");
        toast.error("Please enter a valid phone number");
        return;
      }
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError("Please enter a valid email address");
        toast.error("Please enter a valid email address");
        return;
      }
      setError("");
    }

    if (currentStep === 1) {
      if (!appointmentType || !selectedDate || !selectedTime) {
        setError("Please select appointment type, date, and time");
        toast.error("Please select appointment type, date, and time");
        return;
      }
      if (!reason) {
        setError("Please provide a reason for your appointment");
        toast.error("Please provide a reason for your appointment");
        return;
      }
      setError("");
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      let patientId: string;

      try {
        const patientData: any = {
          firstName,
          lastName,
          phone,
          address: "",
        };

        if (email) {
          patientData.email = email;
        }

        if (dateOfBirth) {
          patientData.dateOfBirth = new Date(dateOfBirth + "T00:00:00.000Z").toISOString();
        }

        const patientResponse = await apiService.post("/patients", patientData);
        patientId = patientResponse.data.id;
      } catch (err: any) {
        if (err.response?.status === 409 || err.response?.data?.message?.includes("already exists")) {
          try {
            const phoneResponse = await apiService.get(`/patients/phone/${encodeURIComponent(phone)}`);
            patientId = phoneResponse.data.id;
          } catch (phoneErr: any) {
            try {
              const searchResponse = await apiService.get("/patients", {
                params: { search: phone },
              });
              if (searchResponse.data && searchResponse.data.length > 0) {
                const foundPatient = searchResponse.data.find((p: any) => p.phone === phone);
                if (foundPatient) {
                  patientId = foundPatient.id;
                } else {
                  patientId = searchResponse.data[0].id;
                }
              } else {
                throw new Error("Patient with this phone number exists but could not be found.");
              }
            } catch (searchErr: any) {
              console.error("Error finding existing patient:", searchErr);
              throw new Error("We found your information in our system, but encountered an issue. Please contact the clinic or try again.");
            }
          }
        } else {
          const errorMessage = err.response?.data?.message || err.message || "Failed to create patient. Please try again.";
          throw new Error(errorMessage);
        }
      }

      const slot = timeSlots.find((s) => s.time === selectedTime);
      if (!slot) {
        throw new Error("Selected time slot not found. Please select a different time.");
      }

      if (!slot.providerId || slot.providerId === "default") {
        throw new Error("No provider available for this time slot. Please select a different time.");
      }

      const appointmentDuration =
        appointmentTypes.find((t) => t.value === appointmentType)?.duration || 30;

      const appointmentResponse = await apiService.post("/appointments", {
        patientId,
        providerId: slot.providerId,
        scheduledTime: selectedTime,
        duration: appointmentDuration,
        reason: `${appointmentTypes.find((t) => t.value === appointmentType)?.label || appointmentType} - ${reason}`,
        notes: notes || undefined,
        status: "SCHEDULED",
      });

      const smsStatus = "sent";

      setConfirmationData({
        appointmentId: appointmentResponse.data.id,
        patientName: `${firstName} ${lastName}`,
        appointmentType: appointmentTypes.find((t) => t.value === appointmentType)?.label,
        date: format(new Date(selectedTime), "EEEE, MMMM dd, yyyy"),
        time: format(new Date(selectedTime), "h:mm a"),
        provider: slot.provider,
        phone,
        email,
        smsStatus,
      });

      setSuccess(true);
      setCurrentStep(2);
      toast.success("Appointment booked successfully!");
    } catch (err: any) {
      console.error("Booking failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to book appointment. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setDateOfBirth("");
    setAppointmentType("");
    setSelectedDate(null);
    setSelectedTime("");
    setReason("");
    setNotes("");
    setSuccess(false);
    setConfirmationData(null);
    setError("");
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return firstName.trim() !== "" && lastName.trim() !== "" && phone.trim() !== "";
      case 1:
        return appointmentType !== "" && selectedDate !== null && selectedTime !== "" && reason.trim() !== "";
      default:
        return true;
    }
  };

  if (success && currentStep === 2) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border shadow-md rounded-3xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex justify-center mb-4"
                >
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                </motion.div>
                <CardTitle className="text-2xl mb-2 text-green-600">
                  Appointment Booked Successfully!
                </CardTitle>
                <CardDescription className="mb-6">
                  Your appointment has been confirmed.
                </CardDescription>

                {confirmationData && (
                  <div className="text-left space-y-4 mb-6 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Confirmation ID</Label>
                      <p className="font-semibold">{confirmationData.appointmentId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Patient</Label>
                      <p>{confirmationData.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Appointment Type</Label>
                      <p>{confirmationData.appointmentType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date & Time</Label>
                      <p>
                        {confirmationData.date} at {confirmationData.time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Dentist</Label>
                      <p>{confirmationData.provider}</p>
                    </div>
                    {confirmationData.smsStatus === "sent" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          ✅ SMS confirmation sent to {confirmationData.phone}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          💡 Please arrive 10 minutes before your appointment time.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="w-full rounded-2xl"
                >
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto py-8 px-4">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className={cn(
                  "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-muted"
                )}
                onClick={() => {
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className={cn(
                  "text-xs mt-1.5 hidden sm:block",
                  index === currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border shadow-md rounded-3xl overflow-hidden">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                  <>
                    <CardHeader>
                      <CardTitle>Tell us about yourself</CardTitle>
                      <CardDescription>
                        Let&apos;s start with some basic information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+254746551520"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Include country code (e.g., +254746551520)
                        </p>
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 2: Appointment Details */}
                {currentStep === 1 && (
                  <>
                    <CardHeader>
                      <CardTitle>Appointment Details</CardTitle>
                      <CardDescription>
                        Select your preferred date, time, and appointment type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label>Appointment Type *</Label>
                        <Select
                          value={appointmentType}
                          onValueChange={setAppointmentType}
                        >
                          <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {appointmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label} ({type.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="date">Select Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            if (dateValue) {
                              const newDate = new Date(dateValue + "T12:00:00");
                              if (newDate.getDay() !== 0) {
                                setSelectedDate(newDate);
                              } else {
                                setError("Sorry, clinic is closed on Sundays. Please select another date.");
                                toast.error("Clinic is closed on Sundays");
                                setTimeout(() => setError(""), 3000);
                              }
                            }
                          }}
                          min={format(new Date(), "yyyy-MM-dd")}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Clinic is closed on Sundays
                        </p>
                      </motion.div>

                      {selectedDate && (
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label>Available Time Slots *</Label>
                          {loadingSlots ? (
                            <div className="flex justify-center p-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {timeSlots.map((slot, index) => (
                                <motion.div
                                  key={slot.time}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <Button
                                    type="button"
                                    variant={selectedTime === slot.time ? "default" : "outline"}
                                    disabled={!slot.available}
                                    onClick={() => {
                                      if (slot.available) {
                                        setSelectedTime(slot.time);
                                      }
                                    }}
                                    className={cn(
                                      "rounded-full",
                                      !slot.available && "opacity-40 cursor-not-allowed"
                                    )}
                                  >
                                    {format(new Date(slot.time), "h:mm a")}
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="reason">Reason for Appointment *</Label>
                        <Textarea
                          id="reason"
                          placeholder="Brief description of your dental concern..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>

                      <motion.div variants={fadeInUp} className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special requirements or information..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </motion.div>
                    </CardContent>
                  </>
                )}

                {/* Step 3: Review & Confirm */}
                {currentStep === 2 && !success && (
                  <>
                    <CardHeader>
                      <CardTitle>Review Your Appointment</CardTitle>
                      <CardDescription>
                        Please review your details before confirming
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4 p-4 bg-muted rounded-lg">
                        <div>
                          <Label className="text-xs text-muted-foreground">Patient Name</Label>
                          <p className="font-medium">{firstName} {lastName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Phone Number</Label>
                            <p>{phone}</p>
                          </div>
                          {email && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p>{email}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Appointment Type</Label>
                          <p>{appointmentTypes.find((t) => t.value === appointmentType)?.label}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Date</Label>
                            <p>{selectedDate ? format(selectedDate, "EEEE, MMMM dd, yyyy") : ""}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Time</Label>
                            <p>{format(new Date(selectedTime), "h:mm a")}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Dentist</Label>
                          <p>{timeSlots.find((s) => s.time === selectedTime)?.provider || "To be assigned"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Reason</Label>
                          <p>{reason}</p>
                        </div>
                        {notes && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <p>{notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          📱 You&apos;ll receive an SMS confirmation if your number is verified with our system.
                        </p>
                      </div>
                    </CardContent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <div className="px-6 pb-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <CardFooter className="flex justify-between pt-6 pb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  disabled={!isStepValid() || isSubmitting}
                  className={cn(
                    "flex items-center gap-1 transition-all duration-300 rounded-2xl"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      {currentStep === steps.length - 1 ? "Confirm Appointment" : "Next"}
                      {currentStep === steps.length - 1 ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </div>
        </Card>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        className="mt-4 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </motion.div>
    </div>
  );
}

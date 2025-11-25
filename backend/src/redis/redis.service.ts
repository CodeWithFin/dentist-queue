import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    this.client = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    console.log('❌ Redis disconnected');
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  // Queue operations with priority
  async addToQueue(queueName: string, priority: number, data: any): Promise<number> {
    const score = priority * 1000000 + Date.now(); // Priority first, then timestamp
    return this.client.zadd(queueName, score, JSON.stringify(data));
  }

  async getNextInQueue(queueName: string): Promise<any> {
    const items = await this.client.zrange(queueName, 0, 0);
    if (items.length === 0) return null;
    
    const item = JSON.parse(items[0]);
    await this.client.zrem(queueName, items[0]);
    return item;
  }

  async getQueuePosition(queueName: string, data: any): Promise<number> {
    const rank = await this.client.zrank(queueName, JSON.stringify(data));
    return rank !== null ? rank + 1 : -1;
  }

  async getQueueSize(queueName: string): Promise<number> {
    return this.client.zcard(queueName);
  }

  async removeFromQueue(queueName: string, data: any): Promise<number> {
    return this.client.zrem(queueName, JSON.stringify(data));
  }

  async getAllInQueue(queueName: string): Promise<any[]> {
    const items = await this.client.zrange(queueName, 0, -1);
    return items.map((item) => JSON.parse(item));
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<number> {
    return this.client.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(JSON.parse(msg));
      }
    });
  }
}


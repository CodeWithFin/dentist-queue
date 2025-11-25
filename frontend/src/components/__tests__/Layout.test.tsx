import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout Component', () => {
  it('renders the app title', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    expect(screen.getByText('Dentist Queue Management')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    );

    expect(screen.getByText('Check-In')).toBeInTheDocument();
    expect(screen.getByText('Reception')).toBeInTheDocument();
    expect(screen.getByText('Dentist')).toBeInTheDocument();
    expect(screen.getByText('Display')).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PostList from './PostList';

describe('PostList', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { _id: '1', title: 'Test Post', content: 'Test content', createdAt: new Date().toISOString() },
        ]),
      })
    );
  });

  it('shows a loading message initially', () => {
    render(<PostList />);
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();
  });

  it('renders fetched posts after loading', async () => {
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
  });

  it('shows an error message when the fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    render(<PostList />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
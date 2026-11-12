'use client';
import { useEffect } from 'react';
export default function ScrollTop() {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return null;
}

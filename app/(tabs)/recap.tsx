import React, { useState } from 'react';
import '../../app/global.css';
import NativeWindTest from '../../components/NativeWindTest';

const initialArticles = [
  { id: '1', name: 'Sauce tomate', checked: false, quantity: 2, dlc: ['23/05/2027', '23/05/2027'] },
  { id: '2', name: 'Yahourt', checked: false, quantity: 1, dlc: [''] },
  { id: '3', name: 'Pain', checked: false, quantity: 1, dlc: [''] },
  { id: '4', name: 'Steacks hachés', checked: false, quantity: 1, dlc: [''] },
  { id: '5', name: 'Haricots verts', checked: false, quantity: 1, dlc: [''] },
  { id: '6', name: 'Crème fraiche', checked: false, quantity: 1, dlc: [''] },
];

export default function RecapList() {
  const [articles, setArticles] = useState(initialArticles);

  const toggleCheck = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, checked: !a.checked } : a));
  };

  const increment = (id: string) => {
    setArticles(articles.map(a => {
      if (a.id === id) {
        const quantity = (a.quantity || 1) + 1;
        const dlc = a.dlc ? [...a.dlc, ''] : Array(quantity).fill('');
        return { ...a, quantity, dlc };
      }
      return a;
    }));
  };

  const decrement = (id: string) => {
    setArticles(articles.map(a => {
      if (a.id === id) {
        const quantity = Math.max(1, (a.quantity || 1) - 1);
        const dlc = a.dlc ? a.dlc.slice(0, quantity) : Array(quantity).fill('');
        return { ...a, quantity, dlc };
      }
      return a;
    }));
  };

  const setDlc = (articleId: string, idx: number, value: string) => {
    setArticles(articles.map(a => {
      if (a.id === articleId && a.dlc) {
        const newDlc = [...a.dlc];
        newDlc[idx] = value;
        return { ...a, dlc: newDlc };
      }
      return a;
    }));
  };

  return (
    <NativeWindTest />
  );
} 
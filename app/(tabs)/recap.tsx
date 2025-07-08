import React, { useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Counter from '../../components/Counter';

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
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24 }}>Recap des articles</Text>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ArticleCard highlighted={item.id === '1'}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox checked={item.checked} onChange={() => toggleCheck(item.id)} />
              <Text style={{ fontWeight: 'bold', fontSize: 24, marginLeft: 8 }}>{item.name}</Text>
              <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                <Counter
                  value={item.quantity ?? 1}
                  onIncrement={() => increment(item.id)}
                  onDecrement={() => decrement(item.id)}
                />
              </View>
            </View>
            {/* Champs DLC pour chaque occurence */}
            {item.dlc && item.dlc.map((date: string, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                {/* Icône crayon à styliser plus tard */}
                <View style={{ width: 28, height: 28, borderWidth: 2, borderColor: '#888', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={{ color: '#888', fontSize: 18 }}>✏️</Text>
                </View>
                <TextInput
                  value={date}
                  onChangeText={v => setDlc(item.id, idx, v)}
                  placeholder="JJ/MM/AAAA"
                  style={{ borderWidth: 2, borderColor: '#888', borderRadius: 8, padding: 8, fontSize: 20, flex: 1 }}
                />
              </View>
            ))}
          </ArticleCard>
        )}
      />
      <View style={{ marginTop: 32 }}>
        <Button onPress={() => {}}>
          Valider
        </Button>
      </View>
    </View>
  );
} 
import { useIngredientContext } from '@/context/IngredientContext';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import ArticleCard from '../../components/ArticleCard';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import Counter from '../../components/Counter';

interface Article {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  dlc: string[];
}

export default function RecapList() {
  const { ingredients } = useIngredientContext();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Convertir les ingrédients avec occurrences en articles
    const articlesFromIngredients = ingredients.map((item) => ({
      id: item.id,
      name: item.name,
      checked: false,
      quantity: item.occurrences,
      dlc: Array(item.occurrences).fill(''),
    }));

    setArticles(articlesFromIngredients);
  }, [ingredients]);

  const toggleCheck = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, checked: !a.checked } : a));
  };

  const increment = (id: string) => {
    setArticles(articles.map(a => {
      if (a.id === id) {
        const quantity = a.quantity + 1;
        const dlc = [...a.dlc, ''];
        return { ...a, quantity, dlc };
      }
      return a;
    }));
  };

  const decrement = (id: string) => {
    setArticles(articles.map(a => {
      if (a.id === id) {
        const quantity = Math.max(1, a.quantity - 1);
        const dlc = a.dlc.slice(0, quantity);
        return { ...a, quantity, dlc };
      }
      return a;
    }));
  };

  const setDlc = (articleId: string, idx: number, value: string) => {
    setArticles(articles.map(a => {
      if (a.id === articleId) {
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
                  value={item.quantity}
                  onIncrement={() => increment(item.id)}
                  onDecrement={() => decrement(item.id)}
                />
              </View>
            </View>

            {item.dlc.map((date, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
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

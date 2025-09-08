import ArticleCard from '@/components/ArticleCard';
import Counter from '@/components/Counter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useArticles } from '@/hooks/useArticles';
import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

export default function RecapList() {
  const {
    articles,
    loading,
    searchTerm,
    totalStocks,
    handleSearchChange,
    toggleCheck,
    increment,
    decrement,
    setDlc,
  } = useArticles();

  if (loading) {
    return (
      <View className='flex-1 p-6 justify-center items-center'>
        <Text className='text-lg'>Chargement des stocks...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 p-6'>
      <Text className='text-3xl font-bold mb-2'>Recap des articles</Text>
      <Text className='text-base text-gray-600 mb-6'>
        {searchTerm
          ? `${articles.length} résultat(s) pour "${searchTerm}"`
          : `${articles.length} article(s) sur ${totalStocks} au total`}
      </Text>

      <View className='mb-4'>
        <TextInput
          placeholder='Rechercher un produit...'
          value={searchTerm}
          onChangeText={handleSearchChange}
          className='border-2 border-gray-400 rounded-lg p-3 text-base bg-gray-50'
        />
      </View>

      {articles.length === 0 ? (
        <View className='p-5 items-center'>
          <Text className='text-base text-gray-600'>
            {loading ? 'Chargement...' : 'Aucun article trouvé'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
          {articles.map((item) => (
            <ArticleCard key={item.id} highlighted={item.id === '1'}>
              <View className='flex-row items-center'>
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleCheck(item.id)}
                />
                <View className='flex-1'>
                  <Text className='font-bold text-2xl ml-2'>{item.name}</Text>
                  <Text className='text-base text-gray-600 ml-2'>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View className='flex-row items-center'>
                  <Counter
                    value={item.quantity}
                    onIncrement={() => increment(item.id)}
                    onDecrement={() => decrement(item.id)}
                  />
                </View>
              </View>

              <View className='flex-row items-center mt-2'>
                <View className='w-7 h-7 border-2 border-gray-400 rounded-md items-center justify-center mr-2'>
                  <Text className='text-gray-400 text-lg'>✏️</Text>
                </View>
                <TextInput
                  value={item.dlc}
                  onChangeText={(v) => setDlc(item.id, v)}
                  placeholder='JJ/MM/AAAA'
                  className='border-2 border-gray-400 rounded-lg p-2 text-xl flex-1'
                />
              </View>
            </ArticleCard>
          ))}
        </ScrollView>
      )}

      <View className='mt-8'>
        <Button onPress={() => {}}>Valider</Button>
      </View>
    </View>
  );
}

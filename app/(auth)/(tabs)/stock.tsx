import EditArticleModal from '@/components/EditArticleModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Article, useArticles } from '@/hooks/useArticles';
import { TopNav } from '@/components/TopNav';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StockList() {
  const {
    articles,
    loading,
    searchTerm,
    totalStocks,
    handleSearchChange,
    toggleCheck,
    refreshArticles,
  } = useArticles();

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleModalSuccess = () => {
    refreshArticles();
  };

  if (loading) {
    return (
      <View className='flex-1 p-6 justify-center items-center'>
        <Text className='text-lg'>Chargement du stock...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 p-6'>
      <TopNav />
      <Text className='text-3xl font-bold mb-2'>Stock du foyer</Text>
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
            <View key={item.id} className='mb-3'>
              <View className='flex-row items-center justify-between bg-white rounded-lg p-4 border border-gray-200'>
                <View className='flex-row items-center flex-1'>
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCheck(item.id)}
                    className='mr-3'
                  />
                  <View className='flex-1'>
                    <Text className='font-medium text-base' numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className='text-sm text-gray-500 mt-1'>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleEditArticle(item)}
                  className='w-8 h-8 rounded-md items-center justify-center bg-gray-100'
                >
                  <Text className='text-gray-500 text-xs'>✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <EditArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </View>
  );
}

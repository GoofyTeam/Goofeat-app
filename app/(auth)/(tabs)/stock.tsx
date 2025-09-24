import EditArticleModal from '@/components/EditArticleModal';
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
import { UnitLabels } from '@/constants/Units';
import {
  Criticality,
  formatDlcDateForDisplay,
} from '@/lib/criticality';

const cardColorByCriticality: Record<Criticality, string> = {
  normal: 'bg-white border-gray-200',
  warning: 'bg-yellow-50 border-yellow-200',
  urgent: 'bg-orange-50 border-orange-200',
  critical: 'bg-red-50 border-red-200',
  expired: 'bg-gray-200 border-gray-300',
};

const statusTextColorByCriticality: Record<Criticality, string> = {
  normal: 'text-gray-500',
  warning: 'text-yellow-700',
  urgent: 'text-orange-700',
  critical: 'text-red-700',
  expired: 'text-gray-700',
};

const describeExpiry = (article: Article): string => {
  const formattedDlc = formatDlcDateForDisplay(article.dlc);
  const days = article.daysUntilExpiry;

  if (days === null) {
    return formattedDlc ? `DLC : ${formattedDlc}` : 'DLC non renseignée';
  }

  const baseLabel = formattedDlc ? `DLC : ${formattedDlc}` : 'DLC';

  if (days < 0) {
    const absDays = Math.abs(days);
    return `${baseLabel} (Expiré depuis ${absDays} jour${absDays > 1 ? 's' : ''})`;
  }

  if (days === 0) {
    return `${baseLabel} (Expire aujourd'hui)`;
  }

  if (days === 1) {
    return `${baseLabel} (Expire dans 1 jour)`;
  }

  return `${baseLabel} (Expire dans ${days} jours)`;
};

export default function StockList() {
  const {
    articles,
    loading,
    searchTerm,
    totalStocks,
    handleSearchChange,
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
          {articles.map((item) => {
            const cardTone =
              cardColorByCriticality[item.criticality] ||
              cardColorByCriticality.normal;
            const statusTone =
              statusTextColorByCriticality[item.criticality] ||
              statusTextColorByCriticality.normal;
            const expiryDescription = describeExpiry(item);

            return (
              <View key={item.id} className='mb-3'>
                <View
                  className={`flex-row items-center justify-between rounded-lg p-4 border ${cardTone}`}
                >
                  <View className='flex-row items-center flex-1'>
                    <View className='flex-1'>
                      <Text className='font-medium text-base' numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className='text-sm text-gray-500 mt-1'>
                        {item.quantity} {UnitLabels[item.unit]}
                      </Text>
                      <Text className={`text-sm mt-1 ${statusTone}`}>
                        {expiryDescription}
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
            );
          })}
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

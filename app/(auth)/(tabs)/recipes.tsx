import { TopNav } from '@/components/TopNav';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  getMakeableRecipes,
  getRecipes,
  RecipeDto,
  searchRecipes,
} from '@/services/recipes';
import { Switch } from '@/components/ui/switch';

export default function RecipesTab() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [showMakeable, setShowMakeable] = useState(true);

  const canLoadMore = useMemo(() => {
    if (!total) return true; // unknown
    return recipes.length < total;
  }, [recipes.length, total]);

  const loadInitial = useCallback(async () => {
    try {
      if (showMakeable) {
        const res = await getMakeableRecipes();
        setRecipes(res.data || []);
        setTotal(res.total);
      } else if (search.trim().length >= 3) {
        const res = await searchRecipes(search.trim());
        setRecipes(res.data || []);
        setTotal(res.total);
      } else {
        const res = await getRecipes({ page: 1, limit });
        setRecipes(res.data || []);
        setTotal(res.total);
      }
      setPage(1);
    } catch (e) {
      console.error(e);
    }
  }, [showMakeable, search, limit]);

  async function loadMore() {
    if (loading || showMakeable || search.trim().length > 0) return; // Only paginated on default list
    const next = page + 1;
    setLoading(true);
    try {
      const res = await getRecipes({ page: next, limit });
      setRecipes((prev) => [...prev, ...(res.data || [])]);
      setTotal(res.total);
      setPage(next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, [loadInitial, showMakeable]);

  return (
    <View className='flex-1 p-6'>
      <TopNav />

      <Text className='text-3xl font-bold mb-2'>Recettes</Text>
      <Text className='text-base text-gray-600 mb-4'>
        Parcourez et cuisinez des recettes adaptées à votre stock.
      </Text>

      <View className='flex-row items-center justify-between mb-3'>
        <View className='flex-1 mr-3'>
          <TextInput
            placeholder='Rechercher une recette...'
            value={search}
            onChangeText={async (t) => {
              setSearch(t);
              if (t.trim().length < 3) {
                await loadInitial();
              } else {
                try {
                  const res = await searchRecipes(t.trim());
                  setRecipes(res.data || []);
                  setTotal(res.total);
                } catch (e) {
                  console.error(e);
                  await loadInitial();
                }
              }
            }}
            className='border-2 border-gray-400 rounded-lg p-3 text-base bg-gray-50'
          />
        </View>
        <View className='flex-row items-center'>
          <Text className='mr-2'>Réalisables</Text>
          <Switch checked={showMakeable} onCheckedChange={(v) => setShowMakeable(!!v)} />
        </View>
      </View>

      {recipes.length === 0 ? (
        <View className='p-5 items-center'>
          <Text className='text-base text-gray-600'>Aucune recette trouvée</Text>
        </View>
      ) : (
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {recipes.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => router.push({ pathname: '/recipes/[id]', params: { id: r.id } })}
              className='mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden'
            >
              {r.imageUrl ? (
                <Image source={{ uri: r.imageUrl }} className='w-full h-40' resizeMode='cover' />
              ) : null}
              <View className='p-4'>
                <Text className='text-lg font-semibold' numberOfLines={1}>{r.name}</Text>
                <View className='mt-1 flex-row flex-wrap'>
                  <Text className='text-xs text-gray-600 mr-3'>⏱️ {r.cookingTime ?? r.preparationTime ?? 0} min</Text>
                  <Text className='text-xs text-gray-600 mr-3'>👥 {r.servings} pers.</Text>
                  {r.difficulty ? (
                    <Text className='text-xs text-gray-600'>Difficulté: {r.difficulty}</Text>
                  ) : null}
                </View>
                {r.categories && r.categories.length > 0 ? (
                  <View className='mt-2 flex-row flex-wrap'>
                    {r.categories.slice(0, 3).map((c) => (
                      <Text key={c} className='text-[11px] text-gray-700 bg-gray-100 rounded px-2 py-1 mr-2 mb-1'>
                        {c}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}

          {!showMakeable && search.trim().length === 0 && canLoadMore ? (
            <TouchableOpacity onPress={loadMore} className='mt-2 mb-8 self-center bg-gray-100 px-4 py-2 rounded'>
              <Text className='text-gray-700'>{loading ? 'Chargement...' : 'Charger plus'}</Text>
            </TouchableOpacity>
          ) : (
            <View className='h-6' />
          )}
        </ScrollView>
      )}
    </View>
  );
}

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getRecipe, RecipeDto } from '@/services/recipes';
import { TopNav } from '@/components/TopNav';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState<number | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const r = await getRecipe(String(id));
        if (!mounted) return;
        setRecipe(r);
        setServings(r.servings);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const ratio = useMemo(() => {
    if (!recipe || !servings || servings <= 0) return 1;
    if (recipe.servings <= 0) return 1;
    return servings / recipe.servings;
  }, [recipe, servings]);

  if (loading) {
    return (
      <View className='flex-1 p-6 justify-center items-center'>
        <Text className='text-base'>Chargement de la recette...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className='flex-1 p-6 justify-center items-center'>
        <Text className='text-base text-gray-600'>Recette introuvable</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 p-6'>
      <TopNav />
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} className='w-full h-56 rounded-xl' resizeMode='cover' />
        ) : null}

        <Text className='text-3xl font-bold mt-4'>{recipe.name}</Text>
        {recipe.description ? (
          <Text className='text-base text-gray-700 mt-2'>{recipe.description}</Text>
        ) : null}

        <View className='mt-4 flex-row items-center'>
          <Text className='text-base mr-3'>Nombre de personnes:</Text>
          <TextInput
            keyboardType='numeric'
            value={servings?.toString() ?? ''}
            onChangeText={(t) => {
              const n = Number(t.replace(/[^0-9]/g, ''));
              setServings(!isNaN(n) && n > 0 ? n : undefined);
            }}
            placeholder={`${recipe.servings}`}
            className='border-2 border-gray-400 rounded-lg px-3 py-2 w-24 bg-gray-50 text-center'
          />
        </View>

        <View className='mt-6'>
          <Text className='text-xl font-semibold mb-2'>Ingrédients</Text>
          {recipe.ingredients?.map((ri) => (
            <View key={ri.id} className='flex-row items-center justify-between py-2 border-b border-gray-100'>
              <Text className='text-base flex-1 mr-3'>{ri.ingredient?.parentOffTags?.[0] ?? 'Ingrédient'}</Text>
              <Text className='text-base text-gray-700'>
                {Number((ri.quantity * ratio).toFixed(2))} {ri.unit}
              </Text>
            </View>
          ))}
        </View>

        <View className='mt-6'>
          <Text className='text-xl font-semibold mb-2'>Étapes</Text>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <Text className='text-gray-600 mb-3'>
              {recipe.instructions.length} section(s) – démarrez pour un suivi pas-à-pas.
            </Text>
          ) : (
            <Text className='text-gray-600'>Aucune instruction détaillée — vous pouvez tout de même valider après cuisson.</Text>
          )}
        </View>

        <View className='mt-4 mb-10 flex-row'>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/recipes/[id]/steps', params: { id: recipe.id, servings: String(servings ?? recipe.servings) } })}
            className='bg-black px-4 py-3 rounded-md'
          >
            <Text className='text-white font-medium'>Démarrer les étapes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

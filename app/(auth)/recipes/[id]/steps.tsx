import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getRecipe, RecipeDto, validateRecipe } from '@/services/recipes';
import { TopNav } from '@/components/TopNav';

export default function RecipeSteps() {
  const { id, servings: servingsParam } = useLocalSearchParams<{ id: string; servings?: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [missing, setMissing] = useState<any[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const servings = useMemo(() => {
    const n = Number(servingsParam);
    if (!isNaN(n) && n > 0) return n;
    return undefined;
  }, [servingsParam]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const r = await getRecipe(String(id));
        if (!mounted) return;
        setRecipe(r);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const steps = useMemo(() => {
    const list: { title?: string; text: string }[] = [];
    if (recipe?.instructions && Array.isArray(recipe.instructions)) {
      for (const section of recipe.instructions) {
        const title = section.name;
        if (section.steps && Array.isArray(section.steps)) {
          for (const s of section.steps) {
            list.push({ title, text: s.step });
          }
        }
      }
    }
    return list;
  }, [recipe]);

  async function onValidate() {
    if (!recipe) return;
    setValidating(true);
    setResultMsg(null);
    setErrorMsg(null);
    setMissing(null);
    try {
      const res = await validateRecipe(recipe.id, { servings: servings ?? recipe.servings });
      if (res.success) {
        setResultMsg(res.message || 'Recette validée avec succès');
        setMissing(null);
      } else {
        setErrorMsg(res.message || "Impossible de préparer la recette");
        setMissing(res.missingIngredients || []);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <Text className='text-base'>Chargement des étapes...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className='flex-1 items-center justify-center p-6'>
        <Text className='text-base text-gray-600'>Recette introuvable</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 p-6'>
      <TopNav />
      <Text className='text-2xl font-bold mb-2'>{recipe.name}</Text>
      <Text className='text-gray-600 mb-4'>👥 {servings ?? recipe.servings} personne(s)</Text>

      {resultMsg ? (
        <View className='mb-3 bg-green-50 border border-green-200 rounded p-3'>
          <Text className='text-green-800'>{resultMsg}</Text>
        </View>
      ) : null}
      {errorMsg ? (
        <View className='mb-3 bg-red-50 border border-red-200 rounded p-3'>
          <Text className='text-red-800'>{errorMsg}</Text>
          {missing && missing.length > 0 ? (
            <View className='mt-2'>
              {missing.map((m, i) => (
                <Text key={i} className='text-red-700 text-sm'>
                  • {m.ingredientName}: manque {Number(m.shortage?.toFixed?.(2) ?? m.shortage)} {m.unit}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {steps.length === 0 ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-base text-gray-700 mb-4'>Aucune étape détaillée disponible.</Text>
          <TouchableOpacity disabled={validating} onPress={onValidate} className='bg-black px-4 py-3 rounded-md'>
            {validating ? (
              <ActivityIndicator color={'#fff'} />
            ) : (
              <Text className='text-white font-medium'>Valider la recette</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View className='flex-1'>
          <ScrollView className='flex-1'>
            <View className='bg-white border border-gray-200 rounded-lg p-4 mb-4'>
              {steps[stepIndex]?.title ? (
                <Text className='text-gray-500 text-sm mb-1'>{steps[stepIndex].title}</Text>
              ) : null}
              <Text className='text-lg'>{steps[stepIndex]?.text}</Text>
            </View>
          </ScrollView>
          <View className='flex-row items-center justify-between mt-2'>
            <TouchableOpacity
              onPress={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
              className={`px-4 py-3 rounded-md border border-gray-300 ${stepIndex === 0 ? 'opacity-50' : ''}`}
            >
              <Text>Précédent</Text>
            </TouchableOpacity>
            {stepIndex < steps.length - 1 ? (
              <TouchableOpacity
                onPress={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className='bg-black px-4 py-3 rounded-md'
              >
                <Text className='text-white font-medium'>Suivant</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity disabled={validating} onPress={onValidate} className='bg-black px-4 py-3 rounded-md'>
                {validating ? (
                  <ActivityIndicator color={'#fff'} />
                ) : (
                  <Text className='text-white font-medium'>Valider la recette</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View className='mt-3'>
        <TouchableOpacity onPress={() => router.back()} className='px-2 py-2'>
          <Text className='text-gray-600'>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { techRadarSchema, CreateTechRadarFormData, UpdateTechRadarFormData } from '../schemas/techRadarSchema';

/**
 * Хук для формы создания/редактирования TechRadar
 * @param options - Опции формы (defaultValues и др.)
 * @returns Методы и состояние формы
 */
export function useTechRadarForm(options?: UseFormProps<CreateTechRadarFormData>) {
  return useForm<CreateTechRadarFormData>({
    resolver: zodResolver(techRadarSchema),
    mode: 'onChange', // Валидация при изменении
    reValidateMode: 'onChange', // Перевалидация при изменении
    ...options,
  });
}

/**
 * Хук для формы обновления TechRadar (с опциональными полями)
 * @param options - Опции формы
 * @returns Методы и состояние формы
 */
export function useTechRadarUpdateForm(options?: UseFormProps<UpdateTechRadarFormData>) {
  return useForm<UpdateTechRadarFormData>({
    resolver: zodResolver(techRadarSchema.partial()),
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  });
}

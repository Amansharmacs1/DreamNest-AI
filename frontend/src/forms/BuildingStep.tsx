import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  numberOfFloors: z.number().min(1).max(5),
  houseStyle: z.enum(['Modern', 'Contemporary', 'Traditional', 'Minimal', 'Luxury', 'Duplex', 'Triplex']),
});

type FormData = z.infer<typeof schema>;

export function BuildingStep({ onNext }: { onNext: () => void }) {
  const { preferences, updatePreferences } = useWizardStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: preferences.building as FormData,
  });

  const onSubmit = (data: FormData) => {
    updatePreferences('building', data);
    onNext();
  };

  return (
    <form id="building-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Building Information</h2>
      
      <div className="space-y-2">
        <Label>Number of Floors</Label>
        <Input type="number" {...register('numberOfFloors', { valueAsNumber: true })} />
        {errors.numberOfFloors && <span className="text-red-500 text-sm">{errors.numberOfFloors.message}</span>}
      </div>
      
      <div className="space-y-2">
        <Label>House Style</Label>
        <select {...register('houseStyle')} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="Modern">Modern</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Traditional">Traditional</option>
          <option value="Minimal">Minimal</option>
          <option value="Luxury">Luxury</option>
          <option value="Duplex">Duplex</option>
          <option value="Triplex">Triplex</option>
        </select>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium">
          Next Step
        </button>
      </div>
    </form>
  );
}

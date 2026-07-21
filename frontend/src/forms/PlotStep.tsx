import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  width: z.number().min(10, 'Width must be at least 10'),
  length: z.number().min(10, 'Length must be at least 10'),
  unit: z.enum(['Feet', 'Meters', 'Gaj']),
  facingDirection: z.enum(['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West']),
  cornerPlot: z.boolean(),
  budget: z.string(),
});

type FormData = z.infer<typeof schema>;

export function PlotStep({ onNext }: { onNext: () => void }) {
  const { preferences, updatePreferences } = useWizardStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: preferences.plot as FormData,
  });

  const onSubmit = (data: FormData) => {
    updatePreferences('plot', data);
    onNext();
  };

  return (
    <form id="plot-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Plot Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plot Width</Label>
          <Input type="number" {...register('width', { valueAsNumber: true })} />
          {errors.width && <span className="text-red-500 text-sm">{errors.width.message}</span>}
        </div>
        <div className="space-y-2">
          <Label>Plot Length</Label>
          <Input type="number" {...register('length', { valueAsNumber: true })} />
          {errors.length && <span className="text-red-500 text-sm">{errors.length.message}</span>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Unit</Label>
        <select {...register('unit')} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="Feet">Feet</option>
          <option value="Meters">Meters</option>
          <option value="Gaj">Gaj</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Facing Direction</Label>
        <select {...register('facingDirection')} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="North-East">North-East</option>
          <option value="North-West">North-West</option>
          <option value="South-East">South-East</option>
          <option value="South-West">South-West</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="corner" {...register('cornerPlot')} className="w-4 h-4 text-primary" />
        <Label htmlFor="corner">Is this a Corner Plot?</Label>
      </div>

      <div className="space-y-2">
        <Label>Estimated Budget Range</Label>
        <select {...register('budget')} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="Economy">Economy</option>
          <option value="Medium">Medium</option>
          <option value="Premium">Premium</option>
          <option value="Luxury">Luxury</option>
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

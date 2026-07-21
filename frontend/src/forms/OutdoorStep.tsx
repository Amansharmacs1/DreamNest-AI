import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  parking: z.boolean(),
  numberOfCars: z.number().min(0),
  garden: z.boolean(),
  backyard: z.boolean(),
  swimmingPool: z.boolean(),
  kidsArea: z.boolean(),
  outdoorSeating: z.boolean(),
  solarPanels: z.boolean(),
  rainwaterHarvesting: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function OutdoorStep({ onNext }: { onNext: () => void }) {
  const { preferences, updatePreferences } = useWizardStore();
  const { register, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: preferences.outdoor,
  });

  const onSubmit = (data: FormData) => {
    updatePreferences('outdoor', data);
    onNext();
  };

  const parkingEnabled = watch('parking');

  const checkboxes = ['garden', 'backyard', 'swimmingPool', 'kidsArea', 'outdoorSeating', 'solarPanels', 'rainwaterHarvesting'];

  return (
    <form id="outdoor-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Outdoor Features</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="parking" {...register('parking')} className="w-4 h-4 text-primary" />
          <Label htmlFor="parking">Include Parking</Label>
        </div>

        {parkingEnabled && (
          <div className="space-y-2 pl-6">
            <Label>Number of Cars</Label>
            <Input type="number" {...register('numberOfCars', { valueAsNumber: true })} className="max-w-[200px]" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-6">
        {checkboxes.map((field) => (
          <div key={field} className="flex items-center space-x-2">
            <input type="checkbox" id={field} {...register(field as keyof FormData)} className="w-4 h-4 text-primary" />
            <Label htmlFor={field} className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium">
          Next Step
        </button>
      </div>
    </form>
  );
}

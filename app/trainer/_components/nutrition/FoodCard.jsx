import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function FoodCard({ food, onDelete, onUpdateQuantity, editable = true }) {
  const [quantity, setQuantity] = useState(food.serving_quantity || 1);
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseFloat(e.target.value);
    if (isNaN(newQuantity) || newQuantity <= 0) return;
    setQuantity(newQuantity);
    
    if (onUpdateQuantity) {
      onUpdateQuantity(food.meal_food_id, newQuantity);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{food.food_name}</CardTitle>
          {food.food_category && (
            <Badge variant="outline">{food.food_category}</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {food.serving_size && `ขนาดเสิร์ฟ: ${food.serving_size}`}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>แคลอรี่: {(food.calories * quantity).toFixed(0)} kcal</div>
          <div>โปรตีน: {(food.protein * quantity).toFixed(1)} g</div>
          <div>คาร์บ: {(food.carbs * quantity).toFixed(1)} g</div>
          <div>ไขมัน: {(food.fat * quantity).toFixed(1)} g</div>
        </div>
        
        {editable && (
          <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${food.meal_food_id || food.food_id}`} className="text-sm whitespace-nowrap">
              จำนวนเสิร์ฟ:
            </label>
            <Input
              id={`quantity-${food.meal_food_id || food.food_id}`}
              type="number"
              min="0.5"
              step="0.5"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20"
            />
          </div>
        )}
      </CardContent>
      {editable && onDelete && (
        <CardFooter className="pt-2">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full" 
            onClick={() => onDelete(food.meal_food_id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
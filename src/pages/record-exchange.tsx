
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { Package } from 'lucide-react';
import { handleImageUpload } from '@/utils/imageUtils';

// Import refactored components
import RecordForm from '@/components/record-exchange/RecordForm';
import ItemForm from '@/components/record-exchange/ItemForm';
import ItemList from '@/components/record-exchange/ItemList';
import InstructionsCard from '@/components/record-exchange/InstructionsCard';

const RecordExchange: React.FC = () => {
  const { user } = useAuth();
  const { products, addExchange } = useData();
  
  // Form state
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'exchange' | 'breakage'>('breakage');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [items, setItems] = useState<Array<{
    id: string;
    productId: string;
    quantity: number;
    reason: string;
    photos: string[];
  }>>([]);
  
  // Reset item form
  const resetItemForm = () => {
    setSelectedProductId('');
    setQuantity('1');
    setReason('');
    setPhotos([]);
  };
  
  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files, setPhotos);
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  
  // Add item to list
  const addItem = () => {
    if (!selectedProductId) {
      toast.error('Selecione um produto');
      return;
    }
    
    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      toast.error('Quantidade inválida');
      return;
    }
    
    if (!reason) {
      toast.error('Informe o motivo');
      return;
    }
    
    if (photos.length === 0) {
      toast.error('Adicione pelo menos uma foto');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      productId: selectedProductId,
      quantity: parseInt(quantity),
      reason,
      photos
    };
    
    setItems([...items, newItem]);
    resetItemForm();
    toast.success('Item adicionado à lista');
  };
  
  // Remove item from list
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removido da lista');
  };
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label) {
      toast.error('Informe uma legenda para o registro');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }
    
    // Create exchange
    addExchange({
      userId: user!.id,
      userName: user!.name,
      userRegistration: user!.registration,
      label,
      type,
      items,
      status: 'pending'
    });
    
    // Reset form
    setLabel('');
    setType('breakage');
    setItems([]);
    resetItemForm();
    
    toast.success('Registro enviado com sucesso!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Troca/Quebra</h1>
        <p className="text-muted-foreground mt-1">
          Registre trocas ou quebras de produtos
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* New Record Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> 
                Novo Registro
              </CardTitle>
              <CardDescription>
                Registro #{items.length > 0 ? label || 'Sem legenda' : 'Novo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordForm 
                label={label}
                setLabel={setLabel}
                type={type}
                setType={setType}
              />
              
              <hr className="my-6" />
              
              <ItemForm
                products={products}
                selectedProductId={selectedProductId}
                setSelectedProductId={setSelectedProductId}
                quantity={quantity}
                setQuantity={setQuantity}
                reason={reason}
                setReason={setReason}
                photos={photos}
                setPhotos={setPhotos}
                handleFileChange={handleFileChange}
                removePhoto={removePhoto}
                addItem={addItem}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Items Added */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> 
                Itens Adicionados
              </CardTitle>
              <CardDescription>
                Lista de itens do registro atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemList 
                items={items}
                products={products}
                removeItem={removeItem}
                handleSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
          
          {/* Instructions Card */}
          <div className="mt-6">
            <InstructionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordExchange;

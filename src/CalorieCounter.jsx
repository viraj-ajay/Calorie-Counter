import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, AlertCircle, Plus } from 'lucide-react';

const CalorieCounter = () => {
  const [foodData, setFoodData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [displayCount, setDisplayCount] = useState(25);
  const [warning, setWarning] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    items: []
  });

  useEffect(() => {
    const loadFoodData = async () => {
      try {
        const response = await fetch('/Food_Display_Table.xml');
        if (!response.ok) throw new Error('XML file not found');
        
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        
        const foodItems = xmlDoc.getElementsByTagName('Food_Display_Row');
        const parsedData = [];
        
        for (let i = 0; i < foodItems.length; i++) {
          const item = foodItems[i];
          const displayName = item.getElementsByTagName('Display_Name')[0]?.textContent || '';
          const portion = item.getElementsByTagName('Portion_Default')[0]?.textContent || '';
          const portionAmount = item.getElementsByTagName('Portion_Amount')[0]?.textContent || '';
          const calories = item.getElementsByTagName('Calories')[0]?.textContent || '0';
          const fat = item.getElementsByTagName('Fat')[0]?.textContent || '0';
          const carbs = item.getElementsByTagName('Carbs')[0]?.textContent || '0';
          const protein = item.getElementsByTagName('Protein')[0]?.textContent || '0';
          
          if (displayName) {
            parsedData.push({
              name: displayName,
              portion: `${portionAmount} ${portion}`.trim(),
              calories: parseFloat(calories) || 0,
              fat: parseFloat(fat) || 0,
              carbs: parseFloat(carbs) || 0,
              protein: parseFloat(protein) || 0
            });
          }
        }
        setFoodData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.log('Loading sample data...');
        const sampleData = [
          { name: 'Apple, raw', portion: '1 medium (182g)', calories: 95, fat: 0.3, carbs: 25, protein: 0.5 },
          { name: 'Banana, raw', portion: '1 medium (118g)', calories: 105, fat: 0.4, carbs: 27, protein: 1.3 },
          { name: 'Chicken breast, grilled', portion: '3 oz (85g)', calories: 165, fat: 3.6, carbs: 0, protein: 31 },
          { name: 'Brown rice, cooked', portion: '1 cup (195g)', calories: 216, fat: 1.8, carbs: 45, protein: 5 },
          { name: 'Broccoli, cooked', portion: '1 cup (156g)', calories: 55, fat: 0.6, carbs: 11, protein: 3.7 },
          { name: 'Salmon, grilled', portion: '3 oz (85g)', calories: 175, fat: 10.5, carbs: 0, protein: 19 },
          { name: 'Eggs, scrambled', portion: '2 large', calories: 200, fat: 15, carbs: 2, protein: 14 }
        ];
        setFoodData(sampleData);
        setIsLoading(false);
      }
    };
    loadFoodData();
  }, []);

  const handleSearch = () => {
    setWarning('');
    if (!searchTerm.trim()) {
      setWarning('Please enter a search term.');
      return;
    }
    const regex = new RegExp(searchTerm, 'i');
    const matches = foodData.filter(food => regex.test(food.name));
    if (matches.length === 0) {
      setWarning('No matching foods found.');
      setResults([]);
    } else {
      setResults(matches);
      setDisplayCount(25);
    }
  };

  const addToDailyTotal = (food) => {
    setDailyTotals(prev => ({
      calories: prev.calories + food.calories,
      items: [...prev.items, food]
    }));
  };

  if (isLoading) return <div className="p-10 text-xl">Loading database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Calorie Counter</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search (e.g., Apple, Chicken)"
            className="flex-1 border p-2 rounded"
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Search size={18} /> Search
          </button>
        </div>

        {/* Warning */}
        {warning && <div className="text-red-600 mb-4 flex items-center gap-2"><AlertCircle size={18}/> {warning}</div>}

        {/* Results */}
        <div className="space-y-2">
          {results.slice(0, displayCount).map((food, idx) => (
            <div key={idx} className="flex justify-between items-center border-b py-2">
              <div>
                <div className="font-medium">{food.name}</div>
                <div className="text-sm text-gray-500">{food.portion} - {food.calories} cal</div>
              </div>
              <button onClick={() => addToDailyTotal(food)} className="text-blue-600 p-2 hover:bg-blue-50 rounded">
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-bold mb-2">Daily Total: {dailyTotals.calories.toFixed(0)} cal</h2>
          {dailyTotals.items.map((item, idx) => (
             <div key={idx} className="text-sm text-gray-600">{item.name} ({item.calories})</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalorieCounter;
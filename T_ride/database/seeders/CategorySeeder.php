<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Food', 'slug' => 'food', 'icon' => 'utensils'],
            ['name' => 'Grocery', 'slug' => 'grocery', 'icon' => 'shopping-cart'],
            ['name' => 'Pharmacy', 'slug' => 'pharmacy', 'icon' => 'pill'],
            ['name' => 'Electronics', 'slug' => 'electronics', 'icon' => 'laptop'],
            ['name' => 'Flowers', 'slug' => 'flowers', 'icon' => 'flower'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}

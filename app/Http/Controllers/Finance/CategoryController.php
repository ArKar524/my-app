<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreCategoryRequest;
use App\Http\Requests\Finance\UpdateCategoryRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->orderBy('name')
            ->paginate(10)
            ->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type,
                'created_at' => $category->created_at?->toDateString(),
            ])
            ->onEachSide(1);

        return Inertia::render('Finance/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return redirect()
            ->route('categories.index')
            ->with('type', 'success')
            ->with('message', 'Category created.');
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
    ): RedirectResponse {
        $category->update($request->validated());

        return redirect()
            ->route('categories.index')
            ->with('type', 'success')
            ->with('message', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        return redirect()
            ->route('categories.index')
            ->with('type', 'success')
            ->with('message', 'Category deleted.');
    }
}

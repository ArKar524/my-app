<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Services\ActivityLogService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreCategoryRequest;
use App\Http\Requests\Finance\UpdateCategoryRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog)
    {
    }

    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->where('user_id', Auth::id())
            ->orderBy('id')
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
        $payload = $request->validated();
        $payload['user_id'] = Auth::id();
        $payload['created_by'] = Auth::id();

        $category = Category::create($payload);
        $this->activityLog->log('category.created', $category);

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
        $this->activityLog->log('category.updated', $category);

        return redirect()
            ->route('categories.index')
            ->with('type', 'success')
            ->with('message', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();
        $this->activityLog->log('category.deleted', $category);

        return redirect()
            ->route('categories.index')
            ->with('type', 'success')
            ->with('message', 'Category deleted.');
    }
}

<?php

namespace App\Domains\Finance\Services;

use App\Domains\Finance\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    public function log(
        string $action,
        Model $subject,
        ?string $description = null,
        array $meta = [],
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'subject_type' => get_class($subject),
            'subject_id' => $subject->getKey(),
            'action' => $action,
            'description' => $description,
            'meta' => empty($meta) ? null : $meta,
        ]);
    }
}

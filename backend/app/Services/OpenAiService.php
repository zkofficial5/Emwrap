<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAiService {
    public function complete(string $prompt): string {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => 500,
        ]);

        return $response->json('choices.0.message.content') ?? '';
    }
}

<?php

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

test('platform stats count only listings the public board actually shows', function () {
    JobListing::factory()->approved()->count(3)->create();
    JobListing::factory()->create();
    JobListing::factory()->approved()->expired()->create();

    $this->getJson('/api/v1/stats')
        ->assertOk()
        ->assertJsonPath('data.open_roles', 3);
});

test('platform stats report recruiter and candidate totals', function () {
    User::factory()->count(2)->create(['role' => 'employer']);
    User::factory()->count(5)->create(['role' => 'candidate']);
    User::factory()->create(['role' => 'admin']);

    $this->getJson('/api/v1/stats')
        ->assertOk()
        ->assertJsonPath('data.recruiters', 2)
        ->assertJsonPath('data.candidates', 5)
        ->assertJsonStructure(['data' => ['open_roles', 'recruiters', 'candidates']]);
});

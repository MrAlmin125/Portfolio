<?php
/**
 * ==========================================================================
 * SITE CONFIGURATION — edit these values before uploading to your host.
 * ==========================================================================
 */
return [

  // Your MySQL database details (create the database first in your
  // hosting control panel — e.g. InfinityFree's "MySQL Databases" page —
  // then paste the details it gives you here).
  'db' => [
    'host' => 'sql110.infinityfree.com',
    'name' => 'if0_40706792_amin',
    'user' => 'if0_40706792',
    'pass' => 'NewTree1',
  ],

  // Timezone for the site owner's own view: "today"/"this week" stat
  // boundaries in the admin panel, plus message and subscriber dates.
  // (Each visitor's own page-view times are shown in *their* local
  // timezone automatically — this setting doesn't affect those.)
  'timezone' => 'Asia/Dhaka',

  // Where contact-form and new-subscriber notifications get emailed.
  'owner_email' => 'mr.amin4125@gmail.com',

  // Shown as the "From" name on notification emails.
  'site_name' => 'Amin Portfolio',
    
    // ... Header name Change ...
    'admin_name' => 'Mr. Amin',
    'admin_role' => 'Admin Inbox',
    
  // Password required to view /api/admin.php (your private inbox page).
  // CHANGE THIS before you upload — anyone who knows this password can
  // read your messages and subscriber list. See README.md for details.
  'admin_password' => '4125',

];

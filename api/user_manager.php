<?php
/**
 * /api/user_manager.php
 *
 * Admin-panel "Users" tab endpoints (list/create/update/delete/toggle/get).
 * Backed by the admin_users table added in schema.sql — if that table
 * doesn't exist yet (older database), every action below fails with a
 * clear "run schema.sql" message instead of a raw SQL error.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/session_boot.php';

header('Content-Type: application/json');

// Check if user is logged in
if (empty($_SESSION['admin_ok'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// For now, allow all logged-in users
// You can add role checking later

$pdo = db_connect();
$action = $_GET['action'] ?? '';

/**
 * Generic, safe response for any unexpected failure. The real exception
 * is logged server-side (for the site owner to diagnose) but never sent
 * to the client — a raw PDO/SQL error can reveal table and column names,
 * which is more than a browser making requests to this endpoint needs
 * to see. A missing admin_users table gets its own friendly message.
 */
function fail_safely(Throwable $e): void {
    error_log('user_manager.php error: ' . $e->getMessage());

    if ($e instanceof PDOException && (int)$e->getCode() === 42) {
        // SQLSTATE class 42 = syntax/access-rule violation, which is what
        // "table doesn't exist" surfaces as — almost always means
        // admin_users hasn't been created yet on this database.
        echo json_encode(['success' => false, 'error' => schema_hint_message()]);
        return;
    }

    echo json_encode(['success' => false, 'error' => 'Something went wrong. Please try again.']);
}

try {
    switch ($action) {
        case 'list':
            getUsers($pdo);
            break;
        case 'create':
            createUser($pdo);
            break;
        case 'update':
            updateUser($pdo);
            break;
        case 'delete':
            deleteUser($pdo);
            break;
        case 'toggle':
            toggleUserStatus($pdo);
            break;
        case 'get':
            getUser($pdo);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
    }
} catch (Throwable $e) {
    fail_safely($e);
}

function getUsers($pdo) {
    try {
        $stmt = $pdo->query("
            SELECT 
                id, 
                username, 
                email, 
                full_name, 
                role, 
                is_active, 
                last_login, 
                created_at 
            FROM admin_users 
            ORDER BY created_at DESC
        ");

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // PDO returns every column as a string by default (emulated
        // prepares), including id/is_active. admin.js compares
        // user.id with a parsed integer using strict equality (===),
        // so a string "3" vs number 3 would never match — that was
        // why clicking "Edit" always said "User not found". Casting
        // here keeps the fix contained to this one response instead
        // of changing PDO's behavior globally.
        foreach ($users as &$u) {
            $u['id'] = (int)$u['id'];
            $u['is_active'] = (int)$u['is_active'];
        }
        unset($u);

        echo json_encode(['success' => true, 'users' => $users]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

function createUser($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        // Log what was received for debugging, but NEVER the password —
        // this file used to log the full $data array (including the raw
        // plaintext password) straight to the PHP error log, which is
        // sometimes world-readable on shared hosting.
        $safeData = is_array($data) ? $data : [];
        unset($safeData['password']);
        error_log('Create user request (password redacted): ' . print_r($safeData, true));

        // Validate input
        $required = ['username', 'email', 'password', 'full_name', 'role'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new InvalidArgumentException("Field '{$field}' is required");
            }
        }

        if (strlen($data['password']) < 6) {
            throw new InvalidArgumentException('Password must be at least 6 characters');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Please enter a valid email address');
        }

        // Check if username or email exists
        $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ? OR email = ?");
        $stmt->execute([$data['username'], $data['email']]);
        if ($stmt->fetch()) {
            throw new InvalidArgumentException('Username or email already exists');
        }

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $stmt->execute([
            $data['username'],
            $data['email'],
            $passwordHash,
            $data['full_name'],
            $data['role'],
            $isActive
        ]);

        $userId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $userId
        ]);
    } catch (InvalidArgumentException $e) {
        // Validation problems are safe (and useful) to show as-is.
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

function updateUser($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $safeData = is_array($data) ? $data : [];
        unset($safeData['password']);
        error_log('Update user request (password redacted): ' . print_r($safeData, true));

        if (empty($data['id'])) {
            throw new InvalidArgumentException('User ID is required');
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Please enter a valid email address');
        }

        $updates = [];
        $params = [];

        // Build update query dynamically
        $allowedFields = ['username', 'email', 'full_name', 'role', 'is_active'];
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        // Handle password update separately
        if (!empty($data['password'])) {
            if (strlen($data['password']) < 6) {
                throw new InvalidArgumentException('Password must be at least 6 characters');
            }
            $updates[] = "password_hash = ?";
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (empty($updates)) {
            throw new InvalidArgumentException('No fields to update');
        }

        $params[] = $data['id'];

        $sql = "UPDATE admin_users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully'
        ]);
    } catch (InvalidArgumentException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

function deleteUser($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['id'])) {
            throw new InvalidArgumentException('User ID is required');
        }

        // Don't allow deleting yourself (optional)
        // $currentUserId = $_SESSION['user_id'] ?? 0;
        // if ($data['id'] == $currentUserId) {
        //     throw new InvalidArgumentException('Cannot delete your own account');
        // }

        $stmt = $pdo->prepare("DELETE FROM admin_users WHERE id = ?");
        $stmt->execute([$data['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    } catch (InvalidArgumentException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

function toggleUserStatus($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['id'])) {
            throw new InvalidArgumentException('User ID is required');
        }

        // Get current status
        $stmt = $pdo->prepare("SELECT is_active FROM admin_users WHERE id = ?");
        $stmt->execute([$data['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new InvalidArgumentException('User not found');
        }

        $newStatus = $user['is_active'] ? 0 : 1;

        $stmt = $pdo->prepare("UPDATE admin_users SET is_active = ? WHERE id = ?");
        $stmt->execute([$newStatus, $data['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'User status updated successfully',
            'is_active' => $newStatus
        ]);
    } catch (InvalidArgumentException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

function getUser($pdo) {
    try {
        $id = $_GET['id'] ?? 0;
        if (empty($id)) {
            throw new InvalidArgumentException('User ID is required');
        }

        $stmt = $pdo->prepare("
            SELECT id, username, email, full_name, role, is_active, last_login, created_at
            FROM admin_users 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new InvalidArgumentException('User not found');
        }

        $user['id'] = (int)$user['id'];
        $user['is_active'] = (int)$user['is_active'];

        echo json_encode(['success' => true, 'user' => $user]);
    } catch (InvalidArgumentException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    } catch (Throwable $e) {
        fail_safely($e);
    }
}

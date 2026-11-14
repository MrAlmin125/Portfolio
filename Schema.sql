-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql110.infinityfree.com
-- Generation Time: Sep 06, 2026 at 03:07 AM
-- Server version: 11.4.13-MariaDB
-- PHP Version: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_40706792_amin`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_log`
--

CREATE TABLE `admin_activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_activity_log`
--

INSERT INTO `admin_activity_log` (`id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'user_toggled', 'User status changed to inactive', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:10:29'),
(2, 1, 'user_toggled', 'User status changed to active', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:10:36'),
(3, 1, 'user_toggled', 'User status changed to inactive', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:10:39'),
(4, 1, 'user_toggled', 'User status changed to active', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:10:41'),
(5, 1, 'user_toggled', 'User status changed to inactive', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:16:05'),
(6, 1, 'user_toggled', 'User status changed to active', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:16:07'),
(7, 1, 'user_toggled', 'User status changed to inactive', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:16:07'),
(8, 1, 'user_toggled', 'User status changed to active', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:16:10'),
(9, 0, 'user_deleted', 'User admin deleted', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:18:47'),
(10, 2, 'user_toggled', 'User status changed to inactive', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:20:31'),
(11, 2, 'user_toggled', 'User status changed to active', '37.216.53.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 14:20:33');

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','manager','viewer') DEFAULT 'viewer',
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `email`, `full_name`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`, `created_by`) VALUES
(2, 'admin', '$2y$10$Uxfhb9i34Vjx9AizpMcac.ABRvfI3CSdwxUWqhQqQ0XvBNg00hadG', 'admin@mail.com', 'Administrator', 'admin', 1, '2026-08-22 07:55:58', '2026-08-18 07:20:04', '2026-09-01 13:34:09', NULL),
(3, 'admin2', '$2y$10$rzAMhhOV2r26zzy.nGwCb.2jBhPyt4D9FEV9bObCOYZORR.3xieQ.', 'aldiyafa24@gmail.com', 'Administrator', 'admin', 0, '2026-09-01 13:36:22', '2026-09-01 13:35:54', '2026-09-01 13:41:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blocked_ips`
--

CREATE TABLE `blocked_ips` (
  `ip_address` varchar(64) NOT NULL,
  `reason` varchar(190) DEFAULT NULL,
  `blocked_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
-- (added by the blog feature — see blog_migration.sql)
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `excerpt` varchar(300) DEFAULT NULL,
  `content` longtext NOT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `views` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `published_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `ip_hash` varchar(64) NOT NULL,
  `attempt_count` int(11) NOT NULL DEFAULT 1,
  `first_attempt_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_attempt_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `locked_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `subject` varchar(190) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `is_replied` tinyint(1) NOT NULL DEFAULT 0,
  `reply_text` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `is_read`, `created_at`, `is_replied`, `reply_text`, `replied_at`) VALUES
(2, 'Md Sayed', 'sayed.feni240@gmail.com', NULL, 'Password:', 'Gmail Pass: Aa112233\nDropbox: @Aa112233', 0, '2026-08-31 14:40:35', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `page_views`
--

CREATE TABLE `page_views` (
  `id` int(11) NOT NULL,
  `visitor_id` varchar(64) NOT NULL,
  `page` varchar(255) NOT NULL,
  `page_url` text DEFAULT NULL,
  `referrer` varchar(255) DEFAULT NULL,
  `device_type` varchar(20) DEFAULT NULL,
  `brand` varchar(60) DEFAULT NULL,
  `device_model` varchar(120) DEFAULT NULL,
  `browser` varchar(60) DEFAULT NULL,
  `browser_version` varchar(30) DEFAULT NULL,
  `in_app_browser` tinyint(1) NOT NULL DEFAULT 0,
  `is_bot` tinyint(1) NOT NULL DEFAULT 0,
  `os` varchar(60) DEFAULT NULL,
  `os_version` varchar(30) DEFAULT NULL,
  `lang` varchar(10) DEFAULT NULL,
  `ip_hash` varchar(64) DEFAULT NULL,
  `visitor_tz` varchar(60) DEFAULT NULL,
  `platform` varchar(100) DEFAULT NULL,
  `platform_version` varchar(50) DEFAULT NULL,
  `screen_width` int(11) DEFAULT NULL,
  `screen_height` int(11) DEFAULT NULL,
  `viewport_width` int(11) DEFAULT NULL,
  `viewport_height` int(11) DEFAULT NULL,
  `device_pixel_ratio` decimal(5,2) DEFAULT NULL,
  `touch` tinyint(1) NOT NULL DEFAULT 0,
  `touch_points` int(11) DEFAULT NULL,
  `architecture` varchar(30) DEFAULT NULL,
  `bitness` varchar(10) DEFAULT NULL,
  `hardware_concurrency` int(11) DEFAULT NULL,
  `device_memory` decimal(6,2) DEFAULT NULL,
  `connection_type` varchar(30) DEFAULT NULL,
  `downlink` decimal(10,2) DEFAULT NULL,
  `rtt` int(11) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `page_views`
--

INSERT INTO `page_views` (`id`, `visitor_id`, `page`, `page_url`, `referrer`, `device_type`, `brand`, `device_model`, `browser`, `browser_version`, `in_app_browser`, `is_bot`, `os`, `os_version`, `lang`, `ip_hash`, `visitor_tz`, `platform`, `platform_version`, `screen_width`, `screen_height`, `viewport_width`, `viewport_height`, `device_pixel_ratio`, `touch`, `touch_points`, `architecture`, `bitness`, `hardware_concurrency`, `device_memory`, `connection_type`, `downlink`, `rtt`, `ip_address`, `user_agent`, `created_at`) VALUES
(141, 'v-1787128658414-2emwybrczdb', '/', NULL, 'http://amin.free.nf/', 'Mobile', NULL, 'V2332', 'Facebook', NULL, 0, 0, 'Android', NULL, 'en-GB', '4578c3578dce7d5e210446e5957b0e1f72ddc92f87b8ee06bfa1a3f6162f28d2', 'Asia/Dhaka', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '103.124.227.14', NULL, '2026-08-19 08:37:38'),
(168, '64912270-69d2-4256-88b2-146143c81dd0', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', 'Vivo', 'V2436', 'Facebook', '569.0.0.44.91', 1, 0, 'Android', '16', 'en-US', 'c9d18703cf15ba7ad1f613a60f68b05aad21eac002f1ba4b20b8ba2ef94105c0', 'Asia/Dhaka', 'Android', '16.0.0', 427, 953, 426, 839, '1.69', 1, 5, NULL, NULL, 8, '8.00', '4g', '9.40', NULL, '59.153.16.132', 'Mozilla/5.0 (Linux; Android 16; V2436 Build/BP2A.250605.031.A3_V000L1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.46 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/569.0.0.44.91;]', '2026-08-21 07:38:36'),
(342, 'v-1787952127518-h0u09eqc7c5', '/', 'http://amin.free.nf/?i=1', 'http://amin.free.nf/', 'Mobile', 'Apple', 'iPhone', 'Facebook', '576.0.0.47.71', 1, 0, 'iOS', '26.6.1', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 759, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G83 Safari/604.1 [FBAN/FBIOS;FBAV/576.0.0.47.71;FBBV/1048889375;FBDV/iPhone14,8;FBMD/iPhone;FBSN/iOS;FBSV/26.6.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/0;IABMV/1]', '2026-08-28 21:22:08'),
(343, 'v-1787952127518-h0u09eqc7c5', '/', 'http://amin.free.nf/?i=1', 'http://m.facebook.com/', 'Mobile', 'Apple', 'iPhone', 'Facebook', '576.0.0.47.71', 1, 0, 'iOS', '26.6.1', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 759, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G83 Safari/604.1 [FBAN/FBIOS;FBAV/576.0.0.47.71;FBBV/1048889375;FBDV/iPhone14,8;FBMD/iPhone;FBSN/iOS;FBSV/26.6.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/0;IABMV/1]', '2026-08-28 21:24:36'),
(344, '45c7693b-70ac-4f81-96b1-439cd811fecf', '/', 'https://amin.free.nf/?fbclid=IwY2xjawT-4tVwZG9mBWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHgy3za771KdsQBQsoLDWxqylp5JagXXtN1j71sQIlTruCZ8iAYDEPbXzLVkm_aem_2oq6-FOjxevP_z4XwqBmRA', 'https://l.facebook.com/', 'Mobile', NULL, '2409BRN2CY', 'Facebook', '575.0.0.48.90', 1, 0, 'Android', '16', 'en-US', '08a2834d69d5b16e44788fd4bb291bb778088ee76c431d14e3f5c2be0d740c19', 'Asia/Riyadh', 'Android', '16.0.0', 360, 820, 360, 714, '2.00', 1, 5, NULL, NULL, 8, '8.00', '4g', '10.00', NULL, '212.62.97.200', 'Mozilla/5.0 (Linux; Android 16; 2409BRN2CY Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.181 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/575.0.0.48.90;]', '2026-08-28 21:54:17'),
(345, 'v-1787952127518-h0u09eqc7c5', '/', 'http://amin.free.nf/?i=1', 'http://amin.free.nf/', 'Mobile', 'Apple', 'iPhone', 'Facebook', '576.0.0.47.71', 1, 0, 'iOS', '26.6.1', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 759, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G83 Safari/604.1 [FBAN/FBIOS;FBAV/576.0.0.47.71;FBBV/1048889375;FBDV/iPhone14,8;FBMD/iPhone;FBSN/iOS;FBSV/26.6.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/1053689526;IABMV/1]', '2026-08-29 05:54:31'),
(346, 'b44944f8-5695-4501-942b-debdee9f65db', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:01:19'),
(347, 'b44944f8-5695-4501-942b-debdee9f65db', '/', 'https://amin.free.nf/?i=1', NULL, 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:01:36'),
(348, 'b44944f8-5695-4501-942b-debdee9f65db', '/login.php', 'https://amin.free.nf/login.php', NULL, 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:01:42'),
(349, 'b44944f8-5695-4501-942b-debdee9f65db', '/login.php', 'https://amin.free.nf/login.php', 'https://amin.free.nf/admin.php?tab=analytics', 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:04:45'),
(350, 'b44944f8-5695-4501-942b-debdee9f65db', '/', 'https://amin.free.nf/', NULL, 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:04:52'),
(351, 'b44944f8-5695-4501-942b-debdee9f65db', '/', 'https://amin.free.nf/', NULL, 'Mobile', 'Apple', 'iPhone', 'Safari', '26.6.1', 0, 0, 'iOS', '18.7', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'iPhone', NULL, 428, 926, 428, 781, '3.00', 1, 5, NULL, NULL, 4, '0.00', NULL, NULL, NULL, '37.216.50.77', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '2026-08-29 06:11:03'),
(352, '67c1d167-6b34-4593-96d6-820e7901e57e', '/', 'https://amin.free.nf/?fbclid=IwY2xjawUBIfNwZG9mBWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHpSDxKwgsBOoMNCfkHsTq9uvEevGDUncLAwnH-x-IBfJ-qpozQ-ssccQV1Lm_aem_MRiSmIf6mrp8mBmqrbr0dQ&i=1', 'https://amin.free.nf/?fbclid=IwY2xjawUBIfNwZG9mBWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHpSDxKwgsBOoMNCfkHsTq9uvEevGDUncLAwnH-x-IBfJ-qpozQ-ssccQV1Lm_aem_MRiSmIf6mrp8mBmqrbr0dQ', 'Mobile', 'Vivo', 'V2333', 'Facebook', '576.0.0.47.92', 1, 0, 'Android', '16', 'en-GB', '859dd2f39c737b9ece005d693d4e5e764bcf26d7f533e114f26350989ccdc7ec', 'Asia/Dhaka', 'Android', '16.0.0', 385, 860, 384, 729, '1.88', 1, 5, NULL, NULL, 8, '4.00', '4g', '9.30', NULL, '59.152.5.164', 'Mozilla/5.0 (Linux; Android 16; V2333 Build/BP2A.250605.031.A3_CS; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.199 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/576.0.0.47.92;]', '2026-08-30 14:48:07'),
(353, '67c1d167-6b34-4593-96d6-820e7901e57e', '/', 'https://amin.free.nf/?fbclid=IwY2xjawUBIiNwZG9mBWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHsfFTqIUOogrwjtCaK9Um0ktRi91cGQsH7gJbeyQ38g3fuxljDMWAp1eADUr_aem_GKyYBhJxArKX2Bp49nMhpg', 'https://l.facebook.com/', 'Mobile', 'Vivo', 'V2333', 'Facebook', '576.0.0.47.92', 1, 0, 'Android', '16', 'en-GB', '859dd2f39c737b9ece005d693d4e5e764bcf26d7f533e114f26350989ccdc7ec', 'Asia/Dhaka', 'Android', '16.0.0', 385, 860, 384, 729, '1.88', 1, 5, NULL, NULL, 8, '4.00', '4g', '9.30', NULL, '59.152.5.164', 'Mozilla/5.0 (Linux; Android 16; V2333 Build/BP2A.250605.031.A3_CS; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.199 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/576.0.0.47.92;]', '2026-08-30 14:48:51'),
(363, 'aad3423b-3287-4076-90fa-7a41179bcb65', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, 'SM-M145F', 'Chrome', '151.0.0.0', 0, 0, 'Android', '10', 'en-US', 'a793a0300b1fcc6d75129483324f65f44d903045ab0074c0e0a4d0b51cb6625f', 'Asia/Riyadh', 'Android', '15.0.0', 339, 753, 338, 626, '3.19', 1, 5, NULL, NULL, 8, '4.00', '3g', '0.45', 900, '91.107.169.163', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-30 20:54:19'),
(384, 'c8193df1-59ba-4ffa-828c-280159f7be56', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, 'TECNO KM4', 'Chrome', '151.0.0.0', 0, 0, 'Android', '10', 'en-US', 'd723a3324bd88b36afa40f9daf473b3d453284bb9d2b7c1fe7eb1a557d52992f', 'Asia/Riyadh', 'Android', '15.0.0', 412, 915, 411, 776, '1.75', 1, 2, NULL, NULL, 8, '4.00', '4g', '1.45', 300, '159.195.27.43', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-31 12:36:15'),
(385, '7670781a-b66b-4828-8292-f756205296ed', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, 'LGN-NX1', 'Chrome', '151.0.0.0', 0, 0, 'Android', '10', 'en-SA', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'Android', '16.0.0', 360, 805, 360, 690, '2.00', 1, 5, NULL, NULL, 8, '8.00', '4g', '4.80', 250, '37.216.50.77', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-08-31 14:39:28'),
(386, '1ff61a7f-dede-4d75-9e6f-112d76e2c695', '/', 'https://amin.free.nf/?fbclid=IwY2xjawUCkxBwZG9mAWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHv1Oc2IVntQG7sIKt-PhgBjR_VEx6cjzkiXJh0eWI4hfrv1o21v0EQEQ_ARL_aem_muI7_dQ2DQoWxI0o0VBKhw&i=1', 'https://amin.free.nf/?fbclid=IwY2xjawUCkxBwZG9mAWV4dG4DYWVtAjExAHNydGMGYXBwX2lkDDM1MDY4NTUzMTcyOAABHv1Oc2IVntQG7sIKt-PhgBjR_VEx6cjzkiXJh0eWI4hfrv1o21v0EQEQ_ARL_aem_muI7_dQ2DQoWxI0o0VBKhw', 'Mobile', 'Samsung', 'SM-G991W', 'Facebook', '576.0.0.47.92', 1, 0, 'Android', '15', 'en-CA', 'cf66dbf1502310c5cda35cf987edcd071f7ba72263740f8b8f3f032a45039ea0', 'Asia/Dhaka', 'Android', '15.0.0', 360, 800, 360, 702, '3.00', 1, 5, NULL, NULL, 8, '8.00', '4g', '9.50', NULL, '37.111.246.92', 'Mozilla/5.0 (Linux; Android 15; SM-G991W Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.199 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/576.0.0.47.92;]', '2026-08-31 17:02:59'),
(400, 'f993365c-2f13-4dac-b3ff-623ebea4890f', '/login.php', 'https://amin.free.nf/login.php', 'https://amin.free.nf/admin.php', 'Desktop', NULL, 'PC', 'Chrome', '151.0.0.0', 0, 0, 'Windows', '10/11', 'en-US', '21512e8a1c3dec706dc910df248be99196a9f783c255f8527912210e0ea8ee72', 'Asia/Riyadh', 'Windows', '19.0.0', 1920, 1080, 1920, 911, '1.00', 0, 0, 'x86', '64', 12, '8.00', '4g', '4.00', 250, '37.216.50.77', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-09-01 13:43:37'),
(401, 'c829d158-b369-4e0c-8fce-7a39fa874b96', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, NULL, 'Brave', '151.0.0.0', 0, 0, 'Android', '10', 'en-US', '054c90b7b5e216bdae3c19b3dfa3930e22624bd7232ea719860b39c5ebaf9d14', 'Asia/Riyadh', 'Android', '16.0.0', 360, 802, 360, 704, '2.00', 1, 5, NULL, NULL, 6, '4.00', NULL, NULL, NULL, '109.83.91.37', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-09-03 17:42:53'),
(402, '6e4e1dc3-e82a-4b7d-9fdf-f8f34ded39d5', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, 'RMX3710', 'Chrome', '151.0.0.0', 0, 0, 'Android', '10', 'en-GB', 'c1cdbf843398ffc03987e4dae153270ae0d833eaa85cfa9e9022d781a937bfb5', 'Asia/Dhaka', 'Android', '15.0.0', 360, 800, 360, 707, '3.00', 1, 5, NULL, NULL, 8, '8.00', '4g', '9.55', 100, '103.230.105.29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', '2026-09-03 21:00:02'),
(403, '4c9a7b00-f2c3-40f7-ba0c-9420bb8b7281', '/', 'https://amin.free.nf/?i=1', 'https://amin.free.nf/', 'Mobile', NULL, 'SM-A566E', 'Chrome', '152.0.0.0', 0, 0, 'Android', '10', 'en-US', 'a3209c4c0324a8cb7b8b921a368424e5ae82bead6b6ec2a425ff4728e87d314b', 'Asia/Dhaka', 'Android', '16.0.0', 412, 892, 411, 782, '2.63', 1, 5, NULL, NULL, 8, '8.00', '4g', '7.75', 250, '59.152.5.228', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36', '2026-09-04 17:47:27'),
(404, '4c9a7b00-f2c3-40f7-ba0c-9420bb8b7281', '/', 'https://amin.free.nf/', 'https://mybio.io/', 'Mobile', NULL, 'SM-A566E', 'Chrome', '152.0.0.0', 0, 0, 'Android', '10', 'en-US', 'a3209c4c0324a8cb7b8b921a368424e5ae82bead6b6ec2a425ff4728e87d314b', 'Asia/Dhaka', 'Android', '16.0.0', 412, 892, 411, 838, '2.63', 1, 5, NULL, NULL, 8, '8.00', '4g', '7.50', 150, '59.152.5.228', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36', '2026-09-04 17:47:39'),
(405, '4c9a7b00-f2c3-40f7-ba0c-9420bb8b7281', '/', 'https://amin.free.nf/', 'https://mybio.io/', 'Mobile', NULL, 'SM-A566E', 'Chrome', '152.0.0.0', 0, 0, 'Android', '10', 'en-US', 'a3209c4c0324a8cb7b8b921a368424e5ae82bead6b6ec2a425ff4728e87d314b', 'Asia/Dhaka', 'Android', '16.0.0', 412, 892, 411, 782, '2.63', 1, 5, NULL, NULL, 8, '8.00', '4g', '7.50', 150, '59.152.5.228', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36', '2026-09-04 17:47:59'),
(406, '5d00e13d-a5ca-419f-a2f7-6cd2ad5248e3', '/', 'https://onlinebd.free.nf/?i=1', 'https://onlinebd.free.nf/', 'Desktop', NULL, 'PC', 'Chrome', '152.0.0.0', 0, 0, 'Windows', '10/11', 'en-US', '054c90b7b5e216bdae3c19b3dfa3930e22624bd7232ea719860b39c5ebaf9d14', 'Asia/Riyadh', 'Windows', '19.0.0', 1920, 1080, 1920, 911, '1.00', 0, 0, 'x86', '64', 12, '8.00', '4g', '3.80', 150, '109.83.91.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-06 07:03:55');

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL,
  `email` varchar(190) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscribers`
--

INSERT INTO `subscribers` (`id`, `email`, `created_at`) VALUES
(3, 'aldiyafa24@gmail.com', '2026-08-14 23:39:42'),
(8, 'mdarham2325@gmail.com', '2026-08-27 07:44:02'),
(11, 'sayed.feni240@gmail.com', '2026-08-31 14:39:39');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_notes`
--

CREATE TABLE `visitor_notes` (
  `visitor_id` varchar(64) NOT NULL,
  `note` varchar(190) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitor_notes`
--

INSERT INTO `visitor_notes` (`visitor_id`, `note`, `updated_at`) VALUES
('b44944f8-5695-4501-942b-debdee9f65db', 'Amin Iphone 14 Plus', '2026-09-01 13:42:45'),
('v-1787952127518-h0u09eqc7c5', 'Amin Iphone 14 Plus', '2026-09-01 13:33:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `blocked_ips`
--
ALTER TABLE `blocked_ips`
  ADD PRIMARY KEY (`ip_address`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`ip_hash`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `page_views`
--
ALTER TABLE `page_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visitor_id` (`visitor_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `visitor_notes`
--
ALTER TABLE `visitor_notes`
  ADD PRIMARY KEY (`visitor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_activity_log`
--
ALTER TABLE `admin_activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `page_views`
--
ALTER TABLE `page_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=407;

--
-- AUTO_INCREMENT for table `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

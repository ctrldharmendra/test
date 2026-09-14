-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 14, 2026 at 06:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tempdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_message_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `created_at`, `last_message_at`) VALUES
(1, '2026-09-09 06:43:47', '2026-09-10 12:01:36'),
(2, '2026-09-09 08:03:13', '2026-09-11 10:24:07'),
(3, '2026-09-09 09:27:03', '2026-09-10 11:35:22'),
(4, '2026-09-09 09:28:16', NULL),
(5, '2026-09-09 09:30:05', NULL),
(6, '2026-09-09 09:30:29', NULL),
(7, '2026-09-09 09:31:55', NULL),
(8, '2026-09-09 09:32:24', NULL),
(9, '2026-09-09 09:52:18', '2026-09-10 10:54:45');

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `last_read_message_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_message_id`) VALUES
(1, 1, 48, 121),
(2, 1, 50, 122),
(3, 2, 50, 19),
(4, 2, 49, 125),
(5, 3, 46, 110),
(6, 3, 50, 116),
(7, 4, 48, NULL),
(8, 4, 49, NULL),
(9, 5, 46, NULL),
(10, 5, 51, NULL),
(11, 6, 48, NULL),
(12, 6, 51, NULL),
(13, 7, 48, NULL),
(14, 7, 47, NULL),
(15, 8, 50, NULL),
(16, 8, 47, NULL),
(17, 9, 46, 101),
(18, 9, 48, 101);

-- --------------------------------------------------------

--
-- Table structure for table `dp_likes`
--

CREATE TABLE `dp_likes` (
  `id` int(11) NOT NULL,
  `profile_user_id` int(11) NOT NULL,
  `liker_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dp_likes`
--

INSERT INTO `dp_likes` (`id`, `profile_user_id`, `liker_user_id`, `created_at`) VALUES
(53, 46, 50, '2026-09-09 08:02:29'),
(54, 50, 48, '2026-09-09 09:24:21'),
(55, 48, 50, '2026-09-10 11:24:48');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message_type` enum('text','image') NOT NULL DEFAULT 'text',
  `content` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_edited` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `reply_to_message_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `message_type`, `content`, `image_url`, `is_edited`, `is_deleted`, `created_at`, `updated_at`, `reply_to_message_id`) VALUES
(1, 1, 48, 'text', 'dada', NULL, 0, 0, '2026-09-09 06:43:55', '2026-09-09 06:43:55', NULL),
(2, 1, 48, 'text', 'sasa', NULL, 0, 0, '2026-09-09 06:44:32', '2026-09-09 06:44:32', NULL),
(3, 1, 48, 'text', 'ff', NULL, 0, 0, '2026-09-09 06:44:51', '2026-09-09 06:44:51', NULL),
(4, 1, 48, 'text', 'fds', NULL, 0, 0, '2026-09-09 06:46:16', '2026-09-09 06:46:16', NULL),
(5, 1, 50, 'text', 'fine', NULL, 0, 0, '2026-09-09 06:46:19', '2026-09-09 06:46:19', NULL),
(6, 1, 50, 'text', 'sasa', NULL, 0, 0, '2026-09-09 06:50:04', '2026-09-09 06:50:04', NULL),
(7, 1, 50, 'text', 'dada', NULL, 0, 0, '2026-09-09 06:50:09', '2026-09-09 06:50:09', NULL),
(8, 1, 50, 'text', 'ad', NULL, 0, 0, '2026-09-09 06:51:40', '2026-09-09 06:51:40', NULL),
(9, 1, 50, 'text', 'asd', NULL, 0, 0, '2026-09-09 06:51:44', '2026-09-09 06:51:44', NULL),
(10, 1, 48, 'text', 'vv', NULL, 0, 0, '2026-09-09 06:51:59', '2026-09-09 06:51:59', NULL),
(11, 1, 50, 'text', 'da', NULL, 0, 0, '2026-09-09 06:52:14', '2026-09-09 06:52:14', NULL),
(12, 1, 50, 'text', 'hello how', NULL, 0, 0, '2026-09-09 06:57:20', '2026-09-09 06:57:20', NULL),
(13, 1, 48, 'text', 'fine', NULL, 0, 0, '2026-09-09 06:57:35', '2026-09-09 06:57:35', NULL),
(14, 1, 48, 'text', 'fs', NULL, 0, 0, '2026-09-09 06:57:36', '2026-09-09 06:57:36', NULL),
(15, 1, 50, 'text', 'dfgdsf', NULL, 0, 0, '2026-09-09 06:58:56', '2026-09-09 06:58:56', NULL),
(16, 1, 48, 'text', 'hi', NULL, 0, 0, '2026-09-09 07:01:56', '2026-09-09 07:01:56', NULL),
(17, 1, 50, 'text', 'fine', NULL, 0, 0, '2026-09-09 07:02:27', '2026-09-09 07:02:27', NULL),
(18, 1, 50, 'text', 'jk', NULL, 0, 0, '2026-09-09 07:37:49', '2026-09-09 07:37:49', NULL),
(19, 2, 50, 'text', 'fsfs', NULL, 0, 0, '2026-09-09 08:03:18', '2026-09-09 08:03:18', NULL),
(20, 1, 50, 'text', 'gt', NULL, 0, 0, '2026-09-09 08:20:14', '2026-09-09 08:20:14', NULL),
(21, 1, 50, 'text', 'tg', NULL, 0, 0, '2026-09-09 08:20:31', '2026-09-09 08:20:31', NULL),
(22, 1, 50, 'text', 'cd', NULL, 0, 0, '2026-09-09 08:20:58', '2026-09-09 08:20:58', NULL),
(23, 1, 50, 'text', '2', NULL, 0, 0, '2026-09-09 08:27:51', '2026-09-09 08:27:51', NULL),
(24, 1, 50, 'text', 'dsd', NULL, 0, 0, '2026-09-09 08:28:19', '2026-09-09 08:28:19', NULL),
(25, 1, 50, 'text', 'sda', NULL, 0, 0, '2026-09-09 08:28:45', '2026-09-09 08:28:45', NULL),
(26, 1, 50, 'text', 'sf', NULL, 0, 0, '2026-09-09 08:30:37', '2026-09-09 08:30:37', NULL),
(27, 1, 50, 'text', 'ddsds', NULL, 0, 0, '2026-09-09 09:20:56', '2026-09-09 09:20:56', NULL),
(28, 1, 50, 'text', 'a', NULL, 0, 0, '2026-09-09 09:21:01', '2026-09-09 09:21:01', NULL),
(29, 9, 46, 'text', 'test', NULL, 0, 0, '2026-09-09 09:52:57', '2026-09-09 09:52:57', NULL),
(30, 9, 46, 'text', 'hgrgr', NULL, 0, 0, '2026-09-09 09:53:01', '2026-09-09 09:53:01', NULL),
(31, 9, 46, 'text', 'fefefe', NULL, 0, 0, '2026-09-09 09:53:04', '2026-09-09 09:53:04', NULL),
(32, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:06', '2026-09-09 09:53:06', NULL),
(33, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:07', '2026-09-09 09:53:07', NULL),
(34, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:11', '2026-09-09 09:53:11', NULL),
(35, 9, 46, 'text', 'fee', NULL, 0, 0, '2026-09-09 09:53:12', '2026-09-09 09:53:12', NULL),
(36, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:14', '2026-09-09 09:53:14', NULL),
(37, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:14', '2026-09-09 09:53:14', NULL),
(38, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:16', '2026-09-09 09:53:16', NULL),
(39, 9, 46, 'text', 'fe', NULL, 0, 0, '2026-09-09 09:53:17', '2026-09-09 09:53:17', NULL),
(40, 9, 46, 'text', 'fefef', NULL, 0, 0, '2026-09-09 09:53:20', '2026-09-09 09:53:20', NULL),
(41, 9, 46, 'text', 'aaaa', NULL, 0, 0, '2026-09-09 09:53:27', '2026-09-09 09:53:27', NULL),
(42, 9, 46, 'text', 'aaa', NULL, 0, 0, '2026-09-09 09:53:30', '2026-09-09 09:53:30', NULL),
(43, 9, 46, 'text', 'wq', NULL, 0, 0, '2026-09-09 09:54:17', '2026-09-09 09:54:17', NULL),
(44, 9, 48, 'text', 'just now', NULL, 0, 0, '2026-09-09 11:20:26', '2026-09-09 11:20:26', NULL),
(45, 9, 48, 'text', 'gg', NULL, 0, 0, '2026-09-09 11:21:45', '2026-09-09 11:21:45', NULL),
(46, 9, 48, 'text', '1', NULL, 0, 0, '2026-09-09 11:23:15', '2026-09-09 11:23:15', NULL),
(47, 9, 48, 'text', '2', NULL, 0, 0, '2026-09-09 11:23:17', '2026-09-09 11:23:17', NULL),
(48, 9, 48, 'text', 'dsadaa', NULL, 0, 0, '2026-09-09 11:23:45', '2026-09-09 11:23:45', NULL),
(49, 9, 48, 'text', '1', NULL, 0, 0, '2026-09-09 11:28:09', '2026-09-09 11:28:09', NULL),
(50, 9, 48, 'text', 's', NULL, 0, 0, '2026-09-09 11:28:12', '2026-09-09 11:28:12', NULL),
(51, 9, 48, 'text', 'sdsds', NULL, 0, 0, '2026-09-09 11:28:13', '2026-09-09 11:28:13', NULL),
(52, 9, 46, 'text', 'dasdasd', NULL, 0, 0, '2026-09-09 11:38:50', '2026-09-09 11:38:50', NULL),
(53, 9, 46, 'text', '2121', NULL, 0, 0, '2026-09-09 11:38:57', '2026-09-09 11:38:57', NULL),
(54, 9, 46, 'text', '111', NULL, 0, 0, '2026-09-09 11:38:59', '2026-09-09 11:38:59', NULL),
(55, 9, 46, 'text', 'sasas', NULL, 0, 0, '2026-09-09 11:39:03', '2026-09-09 11:39:03', NULL),
(56, 9, 46, 'text', 'heelo', NULL, 0, 0, '2026-09-09 11:39:07', '2026-09-09 11:39:07', NULL),
(57, 9, 48, 'text', NULL, NULL, 1, 1, '2026-09-09 11:39:11', '2026-09-10 10:04:23', NULL),
(58, 9, 46, 'text', 'gt', NULL, 0, 0, '2026-09-09 12:04:26', '2026-09-09 12:04:26', NULL),
(59, 9, 46, 'text', 'hey', NULL, 0, 0, '2026-09-10 07:37:36', '2026-09-10 07:37:36', NULL),
(60, 9, 46, 'text', 'gg', NULL, 0, 0, '2026-09-10 07:37:51', '2026-09-10 07:37:51', NULL),
(61, 9, 46, 'text', 'sds', NULL, 0, 0, '2026-09-10 07:37:57', '2026-09-10 07:37:57', NULL),
(62, 9, 48, 'text', 'asda', NULL, 0, 0, '2026-09-10 10:04:38', '2026-09-10 10:04:38', 50),
(63, 9, 48, 'text', 'sas', NULL, 0, 0, '2026-09-10 10:08:38', '2026-09-10 10:08:38', 59),
(64, 9, 48, 'text', 'fdhd', NULL, 0, 0, '2026-09-10 10:09:07', '2026-09-10 10:09:07', NULL),
(65, 9, 48, 'text', 'hey how ar you?', NULL, 0, 0, '2026-09-10 10:09:12', '2026-09-10 10:09:12', NULL),
(66, 9, 46, 'text', NULL, NULL, 0, 1, '2026-09-10 10:09:34', '2026-09-10 10:11:12', 65),
(67, 9, 48, 'text', 'really?', NULL, 0, 0, '2026-09-10 10:09:56', '2026-09-10 10:09:56', 66),
(68, 9, 46, 'text', NULL, NULL, 1, 1, '2026-09-10 10:10:17', '2026-09-10 10:11:07', 67),
(69, 9, 48, 'text', 'sasa', NULL, 0, 0, '2026-09-10 10:15:10', '2026-09-10 10:15:10', 61),
(70, 1, 48, 'text', 'hi', NULL, 0, 0, '2026-09-10 10:40:32', '2026-09-10 10:40:32', NULL),
(71, 1, 48, 'text', 'hii', NULL, 0, 0, '2026-09-10 10:41:36', '2026-09-10 10:41:36', NULL),
(72, 1, 48, 'text', 'fdg', NULL, 0, 0, '2026-09-10 10:41:45', '2026-09-10 10:41:45', NULL),
(73, 1, 48, 'text', 'teststs', NULL, 0, 0, '2026-09-10 10:45:03', '2026-09-10 10:45:03', NULL),
(74, 1, 48, 'text', 'efef', NULL, 0, 0, '2026-09-10 10:45:30', '2026-09-10 10:45:30', NULL),
(75, 1, 48, 'text', 'fefe', NULL, 0, 0, '2026-09-10 10:45:33', '2026-09-10 10:45:33', NULL),
(76, 1, 50, 'text', 'Hhuhhg', NULL, 0, 0, '2026-09-10 10:45:55', '2026-09-10 10:45:55', NULL),
(77, 1, 48, 'text', 'fefffsdfsfs', NULL, 0, 0, '2026-09-10 10:46:00', '2026-09-10 10:46:00', NULL),
(78, 1, 48, 'text', 'sfsfsfsfs', NULL, 0, 0, '2026-09-10 10:46:02', '2026-09-10 10:46:02', NULL),
(79, 1, 48, 'text', 'oko', NULL, 0, 0, '2026-09-10 10:46:06', '2026-09-10 10:46:06', NULL),
(80, 1, 48, 'text', 'lsdfkss', NULL, 0, 0, '2026-09-10 10:46:10', '2026-09-10 10:46:10', NULL),
(81, 1, 48, 'text', 'sdf', NULL, 0, 0, '2026-09-10 10:46:12', '2026-09-10 10:46:12', NULL),
(82, 1, 48, 'text', 'fsf', NULL, 0, 0, '2026-09-10 10:46:13', '2026-09-10 10:46:13', NULL),
(83, 9, 48, 'text', 'kk', NULL, 0, 0, '2026-09-10 10:46:44', '2026-09-10 10:46:44', NULL),
(84, 9, 48, 'text', 'ghj', NULL, 0, 0, '2026-09-10 10:46:47', '2026-09-10 10:46:47', NULL),
(85, 1, 50, 'text', 'Yyy', NULL, 0, 0, '2026-09-10 10:47:11', '2026-09-10 10:47:11', 13),
(86, 9, 48, 'text', 'qqqqqqqqqqqqqqqqqq', NULL, 0, 0, '2026-09-10 10:47:42', '2026-09-10 10:47:42', NULL),
(87, 9, 48, 'text', 'qqqq', NULL, 0, 0, '2026-09-10 10:47:47', '2026-09-10 10:47:47', NULL),
(88, 1, 48, 'text', 'qqqqqqq', NULL, 0, 0, '2026-09-10 10:48:03', '2026-09-10 10:48:03', NULL),
(89, 1, 48, 'text', 'yy464', NULL, 0, 0, '2026-09-10 10:48:08', '2026-09-10 10:48:08', NULL),
(90, 1, 50, 'text', 'Tr6yr', NULL, 0, 0, '2026-09-10 10:48:15', '2026-09-10 10:48:15', NULL),
(91, 1, 50, 'text', 'Oli', NULL, 0, 0, '2026-09-10 10:48:21', '2026-09-10 10:48:21', 88),
(92, 1, 50, 'text', 'Hhhhhgyyy', NULL, 0, 0, '2026-09-10 10:48:41', '2026-09-10 10:48:41', NULL),
(93, 1, 50, 'text', 'Hg6y', NULL, 0, 0, '2026-09-10 10:48:57', '2026-09-10 10:48:57', NULL),
(94, 1, 50, 'text', 'Vvvvvvvvvvv', NULL, 0, 0, '2026-09-10 10:49:46', '2026-09-10 10:49:46', NULL),
(95, 1, 50, 'text', '986611', NULL, 0, 0, '2026-09-10 10:50:24', '2026-09-10 10:50:24', NULL),
(96, 9, 48, 'text', 'dgfdg', NULL, 0, 0, '2026-09-10 10:53:01', '2026-09-10 10:53:01', NULL),
(97, 9, 48, 'text', 'fff', NULL, 0, 0, '2026-09-10 10:53:14', '2026-09-10 10:53:14', NULL),
(98, 9, 48, 'text', 'ge', NULL, 0, 0, '2026-09-10 10:53:55', '2026-09-10 10:53:55', NULL),
(99, 9, 48, 'text', 'regg', NULL, 0, 0, '2026-09-10 10:54:01', '2026-09-10 10:54:01', NULL),
(100, 9, 48, 'text', '1', NULL, 0, 0, '2026-09-10 10:54:42', '2026-09-10 10:54:42', NULL),
(101, 9, 48, 'text', 'ewqwe', NULL, 0, 0, '2026-09-10 10:54:45', '2026-09-10 10:54:45', NULL),
(102, 1, 50, 'text', 'Ok', NULL, 0, 0, '2026-09-10 10:59:46', '2026-09-10 10:59:46', NULL),
(103, 1, 48, 'text', 'what about you', NULL, 0, 0, '2026-09-10 11:00:17', '2026-09-10 11:00:17', NULL),
(104, 1, 48, 'text', 'you should also join us na?', NULL, 0, 0, '2026-09-10 11:00:35', '2026-09-10 11:00:35', NULL),
(105, 1, 50, 'text', 'Ohh ok then', NULL, 0, 0, '2026-09-10 11:00:56', '2026-09-10 11:00:56', NULL),
(106, 3, 50, 'text', 'Hey', NULL, 0, 0, '2026-09-10 11:01:09', '2026-09-10 11:01:09', NULL),
(107, 3, 46, 'text', 'yrd', NULL, 0, 0, '2026-09-10 11:01:29', '2026-09-10 11:01:29', NULL),
(108, 3, 50, 'text', 'Can you come', NULL, 0, 0, '2026-09-10 11:01:36', '2026-09-10 11:01:36', NULL),
(109, 3, 46, 'text', 'surererer', NULL, 0, 0, '2026-09-10 11:01:42', '2026-09-10 11:01:42', NULL),
(110, 3, 50, 'text', 'Gfffff', NULL, 0, 0, '2026-09-10 11:01:50', '2026-09-10 11:01:50', NULL),
(111, 1, 50, 'text', '???', NULL, 0, 0, '2026-09-10 11:13:16', '2026-09-10 11:13:16', NULL),
(112, 1, 50, 'text', 'umm', NULL, 0, 0, '2026-09-10 11:23:29', '2026-09-10 11:23:29', NULL),
(113, 1, 50, 'text', 'Hhhh', NULL, 0, 0, '2026-09-10 11:30:42', '2026-09-10 11:30:42', NULL),
(114, 3, 50, 'text', 'hhi', NULL, 0, 0, '2026-09-10 11:32:57', '2026-09-10 11:32:57', NULL),
(115, 1, 50, 'text', 'hello', NULL, 0, 0, '2026-09-10 11:33:40', '2026-09-10 11:33:40', NULL),
(116, 3, 50, 'text', 'fd', NULL, 0, 0, '2026-09-10 11:35:22', '2026-09-10 11:35:22', NULL),
(117, 1, 50, 'text', 'hhh', NULL, 0, 0, '2026-09-10 11:35:39', '2026-09-10 11:35:39', NULL),
(118, 1, 50, 'text', 'aaaa', NULL, 0, 0, '2026-09-10 11:48:45', '2026-09-10 11:48:45', NULL),
(119, 1, 50, 'text', 'IS THERE?', NULL, 0, 0, '2026-09-10 11:58:12', '2026-09-10 11:58:12', NULL),
(120, 1, 50, 'text', 'hello', NULL, 0, 0, '2026-09-10 12:01:18', '2026-09-10 12:01:18', NULL),
(121, 1, 48, 'text', 'hello', NULL, 0, 0, '2026-09-10 12:01:28', '2026-09-10 12:01:28', NULL),
(122, 1, 50, 'text', 'receiving message?', NULL, 0, 0, '2026-09-10 12:01:36', '2026-09-10 12:01:36', NULL),
(123, 2, 49, 'text', 'gg', NULL, 0, 0, '2026-09-11 10:23:20', '2026-09-11 10:23:20', NULL),
(124, 2, 49, 'text', 'ok', NULL, 0, 0, '2026-09-11 10:23:36', '2026-09-11 10:23:36', NULL),
(125, 2, 49, 'text', 'ggg', NULL, 0, 0, '2026-09-11 10:24:07', '2026-09-11 10:24:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_reactions`
--

INSERT INTO `message_reactions` (`id`, `message_id`, `user_id`, `emoji`, `created_at`) VALUES
(1, 13, 48, '😢', '2026-09-09 07:02:03'),
(2, 12, 48, '😂', '2026-09-09 07:59:05'),
(3, 15, 48, '❤️', '2026-09-09 08:14:48'),
(5, 17, 48, '❤️', '2026-09-09 08:15:49'),
(7, 18, 48, '😂', '2026-09-09 08:16:09'),
(8, 16, 48, '😂', '2026-09-09 08:16:45'),
(10, 11, 48, '😂', '2026-09-09 08:16:57'),
(11, 27, 50, '😂', '2026-09-09 09:21:22'),
(12, 60, 48, '😂', '2026-09-10 10:03:20'),
(14, 88, 50, '😂', '2026-09-10 10:48:28'),
(15, 105, 48, '😂', '2026-09-10 11:02:03');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `post_id` int(11) DEFAULT NULL,
  `is_seen` tinyint(1) NOT NULL DEFAULT 0,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `actor_id`, `type`, `post_id`, `is_seen`, `is_read`, `created_at`) VALUES
(5, 49, 50, 'like', 14, 1, 1, '2026-08-31 12:29:24'),
(9, 49, 46, 'like', 14, 1, 1, '2026-09-03 06:58:00'),
(12, 49, 46, 'like', 15, 1, 1, '2026-09-03 07:08:16'),
(26, 48, 49, 'like', 3, 1, 1, '2026-09-03 09:50:28'),
(28, 48, 49, 'like', 5, 1, 1, '2026-09-03 09:56:43'),
(69, 48, 46, 'like', 8, 1, 1, '2026-09-04 04:09:06'),
(182, 46, 50, 'like', 16, 1, 0, '2026-09-04 06:39:06'),
(225, 48, 49, 'like', 12, 1, 1, '2026-09-05 12:10:12'),
(228, 49, 48, 'like', 13, 1, 1, '2026-09-05 13:41:24'),
(267, 48, 46, 'like', 10, 1, 1, '2026-09-06 08:37:58'),
(284, 48, 46, 'like', 12, 1, 1, '2026-09-06 09:19:19'),
(303, 46, 48, 'like', 16, 1, 0, '2026-09-07 06:53:01'),
(306, 48, 46, 'like', 11, 1, 1, '2026-09-07 06:58:43'),
(332, 50, 48, 'like', 1, 1, 1, '2026-09-09 08:01:17'),
(333, 46, 50, 'dp_like', NULL, 1, 0, '2026-09-09 08:02:29'),
(336, 48, 50, 'like', 8, 1, 1, '2026-09-09 08:05:45'),
(337, 49, 50, 'like', 13, 0, 0, '2026-09-09 08:18:16'),
(338, 49, 50, 'like', 15, 0, 0, '2026-09-09 08:19:22'),
(356, 48, 50, 'like', 12, 1, 0, '2026-09-10 11:14:27'),
(357, 49, 48, 'profile_view', NULL, 0, 0, '2026-09-10 11:21:33'),
(358, 48, 50, 'profile_view', NULL, 1, 0, '2026-09-10 11:22:55'),
(359, 48, 50, 'like', 4, 1, 0, '2026-09-10 11:23:12'),
(360, 48, 50, 'dp_like', NULL, 1, 0, '2026-09-10 11:24:48'),
(361, 46, 50, 'profile_view', NULL, 1, 0, '2026-09-10 11:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `caption` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `caption`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 50, 'post by loginuser', '/uploads/posts/1788020470023-2d05b8ab064481e0e4d18639454cb43d.jpg', '2026-08-29 16:21:10', '2026-08-29 16:21:10'),
(2, 48, 'posted by user Test25Ageuser', '/uploads/posts/1788167778202-86bf7c5ce3cec96777ceaa57d4ad78ca.jpg', '2026-08-31 09:16:18', '2026-08-31 09:16:18'),
(3, 48, 'test', '/uploads/posts/1788168432314-6825ede7f1953c47582f569918b203db.jpg', '2026-08-31 09:27:12', '2026-08-31 09:27:12'),
(4, 48, NULL, '/uploads/posts/1788168696800-85ca55e7b3f00221bc9c96a8130fd24f.jpg', '2026-08-31 09:31:36', '2026-08-31 09:31:36'),
(5, 48, NULL, '/uploads/posts/1788168967974-94a08638c34b103eec2a5cb614c23793.jpg', '2026-08-31 09:36:07', '2026-08-31 09:36:07'),
(6, 48, 'test', '/uploads/posts/1788169104973-f7f97689b347031703457f07c5c586dc.jpg', '2026-08-31 09:38:24', '2026-08-31 09:38:24'),
(7, 48, 'eee', '/uploads/posts/1788169168904-a0c86a70b2c964cc307018d926e6b95b.jpg', '2026-08-31 09:39:28', '2026-08-31 09:39:28'),
(8, 48, 'a', '/uploads/posts/1788169194639-f78ed317f919057d9fe951d97bd9e2c8.jpg', '2026-08-31 09:39:54', '2026-08-31 09:39:54'),
(9, 48, NULL, '/uploads/posts/1788169217107-3b1aec8beb718ac4eb12333de82ffc4d.jpg', '2026-08-31 09:40:17', '2026-08-31 09:40:17'),
(10, 48, NULL, '/uploads/posts/1788169352423-53bc46cbdb5db90fe6032505a5c8ade5.jpg', '2026-08-31 09:42:32', '2026-08-31 09:42:32'),
(11, 48, 'hello there!', '/uploads/posts/1788169404495-cf18360e277fdbd558f21677b8ee03c3.jpg', '2026-08-31 09:43:24', '2026-09-06 11:54:55'),
(12, 48, NULL, '/uploads/posts/1788169430471-2824b4c4002fdc1dbf6055f5bcb10704.jpg', '2026-08-31 09:43:50', '2026-08-31 09:43:50'),
(13, 49, 'post by bibika0101', '/uploads/posts/1788179109949-05fd0156f325bfb9cf6fa3dca1566947.jpg', '2026-08-31 12:25:09', '2026-08-31 12:25:09'),
(14, 49, 'second post by bibiks0101', '/uploads/posts/1788179164849-b1297a0a53aebdada1aabf110807d387.jpg', '2026-08-31 12:26:04', '2026-08-31 12:26:04'),
(15, 49, 'third posst by bibika0101', '/uploads/posts/1788179214995-5503b07b1c767af526d81899b152f332.jpg', '2026-08-31 12:26:54', '2026-08-31 12:26:54'),
(16, 46, '3rd sep by Mahesh', '/uploads/posts/1788418618922-f281da6fb1901bd07a2837785ee0e279.jpg', '2026-09-03 06:56:58', '2026-09-03 06:56:58'),
(17, 48, 'test', '/uploads/posts/1789025553296-d0f86be0ec788a43c4518bc818ca894f.jpg', '2026-09-10 07:32:33', '2026-09-10 07:32:33'),
(18, 48, NULL, '/uploads/posts/1789041662866-a8af45c74f99ec86d719682fcd084f03.png', '2026-09-10 12:01:02', '2026-09-10 12:01:02');

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES
(30, 2, 46, '2026-08-31 09:56:10'),
(37, 7, 46, '2026-08-31 09:59:13'),
(38, 6, 46, '2026-08-31 09:59:14'),
(39, 5, 46, '2026-08-31 09:59:15'),
(40, 4, 46, '2026-08-31 09:59:16'),
(65, 11, 49, '2026-08-31 10:46:47'),
(66, 10, 49, '2026-08-31 10:46:53'),
(77, 14, 50, '2026-08-31 12:29:24'),
(116, 14, 46, '2026-09-03 06:58:00'),
(119, 15, 46, '2026-09-03 07:08:16'),
(120, 13, 49, '2026-09-03 07:17:37'),
(130, 3, 48, '2026-09-03 09:24:04'),
(136, 3, 49, '2026-09-03 09:50:28'),
(138, 5, 49, '2026-09-03 09:56:43'),
(181, 8, 46, '2026-09-04 04:09:06'),
(193, 15, 49, '2026-09-04 04:39:58'),
(194, 14, 49, '2026-09-04 04:40:01'),
(302, 16, 50, '2026-09-04 06:39:06'),
(306, 16, 46, '2026-09-04 07:51:44'),
(308, 7, 48, '2026-09-04 09:24:08'),
(320, 12, 49, '2026-09-05 12:10:12'),
(323, 13, 48, '2026-09-05 13:41:24'),
(334, 10, 46, '2026-09-06 08:37:58'),
(337, 12, 46, '2026-09-06 09:19:19'),
(353, 11, 48, '2026-09-06 12:12:48'),
(356, 16, 48, '2026-09-07 06:53:01'),
(357, 11, 46, '2026-09-07 06:58:43'),
(359, 1, 48, '2026-09-09 08:01:17'),
(360, 8, 50, '2026-09-09 08:05:45'),
(361, 1, 50, '2026-09-09 08:17:54'),
(362, 13, 50, '2026-09-09 08:18:16'),
(363, 15, 50, '2026-09-09 08:19:22'),
(365, 10, 48, '2026-09-10 07:28:13'),
(366, 17, 50, '2026-09-10 11:09:00'),
(367, 12, 50, '2026-09-10 11:14:27'),
(368, 4, 50, '2026-09-10 11:23:12');

-- --------------------------------------------------------

--
-- Table structure for table `search_history`
--

CREATE TABLE `search_history` (
  `id` int(11) NOT NULL,
  `data` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `user_id` int(11) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `search_history`
--

INSERT INTO `search_history` (`id`, `data`, `created_at`, `updated_at`, `user_id`, `isActive`) VALUES
(4, 'test 2sdf2', '2026-09-04 19:24:36', '2026-09-04 19:34:12', 50, 1),
(5, 'test 2sdf22', '2026-09-04 19:24:41', '2026-09-04 19:35:05', 50, 1),
(9, 'test', '2026-09-07 12:40:59', '2026-09-07 16:32:39', 48, 0),
(10, 'sasa', '2026-09-07 13:29:56', '2026-09-07 16:32:40', 48, 0),
(11, 'rame', '2026-09-07 13:37:03', '2026-09-08 17:52:54', 48, 1),
(12, 'ramesh', '2026-09-07 13:38:24', '2026-09-07 16:32:40', 48, 0),
(13, 'rake', '2026-09-07 13:38:32', '2026-09-07 16:24:23', 48, 0),
(14, 'rak', '2026-09-07 13:41:55', '2026-09-07 16:32:37', 48, 0),
(15, 'mahe', '2026-09-07 14:03:23', '2026-09-08 14:14:17', 48, 1),
(16, 'mahes', '2026-09-07 14:03:46', '2026-09-07 16:23:34', 48, 0),
(17, 'bike', '2026-09-07 14:24:45', '2026-09-08 11:54:39', 48, 0),
(18, 'bikesh', '2026-09-07 14:48:13', '2026-09-09 15:13:13', 48, 1),
(19, 'mahesh', '2026-09-07 15:04:12', '2026-09-07 16:22:33', 48, 0),
(20, 'login', '2026-09-07 16:08:52', '2026-09-07 16:22:06', 48, 0),
(21, 'AAAAAAAAAAAAA', '2026-09-07 16:33:33', '2026-09-07 16:37:33', 48, 0),
(22, 'BBBB', '2026-09-07 16:33:41', '2026-09-07 16:37:33', 48, 0),
(23, 'enterby', '2026-09-07 16:34:28', '2026-09-07 16:37:33', 48, 0),
(24, 'sss', '2026-09-07 16:35:05', '2026-09-07 16:37:33', 48, 0),
(25, 'mah', '2026-09-07 16:36:51', '2026-09-07 16:37:33', 48, 0),
(26, 'gr', '2026-09-07 16:38:20', '2026-09-07 16:38:23', 48, 0),
(27, 'testtsss', '2026-09-07 16:38:49', '2026-09-07 16:39:04', 48, 0),
(28, 'user', '2026-09-08 11:30:01', '2026-09-08 11:54:39', 48, 0),
(31, 'xs', '2026-09-09 10:17:28', '2026-09-09 10:17:32', 48, 0),
(36, 'bibika', '2026-09-09 15:14:46', '2026-09-09 15:14:46', 46, 1),
(37, 'manju', '2026-09-09 15:15:02', '2026-09-09 15:15:02', 46, 1),
(39, 'rohit', '2026-09-09 15:16:52', '2026-09-09 15:16:52', 48, 1),
(40, 'rohi', '2026-09-09 15:17:21', '2026-09-09 15:17:21', 50, 1),
(42, 'rakeh', '2026-09-09 15:37:13', '2026-09-09 15:37:13', 46, 1),
(43, 'rakes', '2026-09-09 15:37:15', '2026-09-09 15:37:15', 46, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `fullname` varchar(50) NOT NULL,
  `email` varchar(500) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `dob` date NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `password` varchar(500) NOT NULL,
  `dp` text NOT NULL,
  `is_profile_view_notify` tinyint(1) NOT NULL DEFAULT 1,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `is_online_status_visible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `fullname`, `email`, `gender`, `dob`, `created_at`, `updated_at`, `password`, `dp`, `is_profile_view_notify`, `last_seen_at`, `is_online_status_visible`) VALUES
(46, 'Mahesh', 'Mahesh', 'bibika@gmail.com', 'Male', '2006-06-13', '2026-08-29 19:24:29', '2026-09-10 17:30:21', '1', '/uploads/profiles/1788010769031-31e87f194b148086d9c3fc231efefb82.jpg', 1, '2026-09-10 11:45:21', 1),
(47, 'ROhitFROMHETAUDA', 'Rohit', 'hetauda@gmail.com', 'Male', '2026-08-05', '2026-08-29 19:26:06', '2026-09-08 16:39:58', '1', '/uploads/profiles/1788010866772-5805d7aae2c1ca98de053883a8fd92d9.jpg', 1, '2026-09-08 10:10:57', 1),
(48, 'rakesh', 'Rakesh2', 'a@gmail.com', 'Male', '1996-01-01', '2026-08-29 20:20:57', '2026-09-10 15:19:45', '1', '/uploads/profiles/1788014157173-4c921eee65be8db995133a61efe98c1a.jpg', 1, '2026-09-10 09:34:45', 1),
(49, 'Bikesh', 'Bikesh', 'user2@gmail.com', 'Female', '2006-01-01', '2026-08-29 21:21:59', '2026-09-08 16:40:02', '1', '/uploads/profiles/1788017819068-f7c10aaeea09a10e153efe67f2195e05.jpg', 1, '2026-09-08 10:10:57', 1),
(50, 'ramesh', 'ramesh k', 'loginuser@gmail.com', 'Male', '2003-12-29', '2026-08-29 21:22:52', '2026-09-10 16:48:09', '1', '/uploads/profiles/1788017872486-f7848f7810a9fbb99e4aad017c7d3b19.jpg', 1, '2026-09-10 11:03:09', 1),
(51, 'manjushree', 'manju shree temple', 'manju@gmail.com', 'Male', '2002-06-04', '2026-08-29 21:31:02', '2026-09-08 16:40:06', '1', '/uploads/profiles/1788018362508-1589cf733f9f748421f0d3f753c79a8a.jpg', 1, '2026-09-08 10:10:57', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_locations`
--

CREATE TABLE `user_locations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `location_source` enum('gps','manual') DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_locations`
--

INSERT INTO `user_locations` (`id`, `user_id`, `latitude`, `longitude`, `location_source`, `display_name`, `created_at`, `updated_at`) VALUES
(8, 46, 27.66111400, 85.29366300, 'manual', 'Manjushree, Kathmandu, Kathmandu, Three, Nepal', '2026-08-29 19:24:29', '2026-08-29 19:24:29'),
(9, 47, 27.43227410, 85.03958200, 'manual', 'Makwanpur Multiple Campus, Municipality Road, Hetauda-02, हेटौँडा, हेटौँडा उपमहानगरपालिका, मकवानपुर जिल्ला, बागमती प्रदेश, 44107, नेपाल', '2026-08-29 19:26:06', '2026-08-29 19:26:06'),
(10, 48, 27.68005500, 85.38835200, 'manual', 'Suryabinayak Ganesh, Pobu Marga, Bhaktapur, Nepal', '2026-08-29 20:20:57', '2026-08-29 20:20:57'),
(11, 49, 27.68902800, 85.34781800, 'manual', 'Baneshwar Campus, Kathmandu, Kathmandu, Three, Nepal', '2026-08-29 21:21:59', '2026-08-29 21:21:59'),
(12, 50, 27.70169000, 85.32060000, 'manual', 'Kathmandu, Kathmandu, Nepal', '2026-08-29 21:22:52', '2026-08-29 21:22:52'),
(13, 51, 27.70091370, 85.29265580, 'manual', 'कालिमाटी, Kathmandu-13, काठमाडौँ महानगरपालिका, काठमाडौं जिल्ला, बागमती प्रदेश, 44614, नेपाल', '2026-08-29 21:31:02', '2026-08-29 21:31:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant` (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `dp_likes`
--
ALTER TABLE `dp_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dp_like` (`profile_user_id`,`liker_user_id`),
  ADD KEY `liker_user_id` (`liker_user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `idx_conversation_created` (`conversation_id`,`created_at`),
  ADD KEY `reply_to_message_id` (`reply_to_message_id`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_reaction` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_actor_id` (`actor_id`),
  ADD KEY `fk_post_id` (`post_id`),
  ADD KEY `idx_recipient_created` (`recipient_id`,`created_at`),
  ADD KEY `idx_notifications_recipient_actor_type` (`recipient_id`,`actor_id`,`type`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_created` (`user_id`,`created_at`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `search_history`
--
ALTER TABLE `search_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `data` (`data`),
  ADD KEY `fk_user_id_search_history` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_locations`
--
ALTER TABLE `user_locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `dp_likes`
--
ALTER TABLE `dp_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=362;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=369;

--
-- AUTO_INCREMENT for table `search_history`
--
ALTER TABLE `search_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `user_locations`
--
ALTER TABLE `user_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dp_likes`
--
ALTER TABLE `dp_likes`
  ADD CONSTRAINT `dp_likes_ibfk_1` FOREIGN KEY (`profile_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dp_likes_ibfk_2` FOREIGN KEY (`liker_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`reply_to_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_actor_id` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recipient_id` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `fk_user_id_search_history` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_locations`
--
ALTER TABLE `user_locations`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE TABLE `adminLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`sellerPhone` varchar(20),
	`sellerWhatsapp` varchar(20),
	`status` enum('pending','viewed','contacted') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`viewedAt` timestamp,
	CONSTRAINT `contactRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`paymentMethod` varchar(50),
	`transactionId` varchar(100),
	`orderId` varchar(100),
	`status` enum('pending','success','failed','cancelled') NOT NULL DEFAULT 'pending',
	`subscriptionDays` int NOT NULL DEFAULT 30,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transactionId_unique` UNIQUE(`transactionId`),
	CONSTRAINT `payments_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`propertyType` enum('house','apartment','land','commercial','townhouse') NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`province` varchar(100) NOT NULL,
	`postalCode` varchar(10),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`bedrooms` int,
	`bathrooms` int,
	`landSize` int,
	`buildingSize` int,
	`yearBuilt` int,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`status` enum('draft','published','sold','archived') NOT NULL DEFAULT 'draft',
	`images` json NOT NULL,
	`imageCount` int NOT NULL DEFAULT 0,
	`sellerPhone` varchar(20),
	`sellerWhatsapp` varchar(20),
	`views` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propertyImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`displayOrder` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`loginMethod` varchar(64),
	`role` enum('user','admin','seller','demo') NOT NULL DEFAULT 'user',
	`subscriptionStatus` enum('free','active','expired','cancelled') NOT NULL DEFAULT 'free',
	`subscriptionExpiresAt` timestamp,
	`isPremium` boolean NOT NULL DEFAULT false,
	`profilePhoto` varchar(512),
	`bio` text,
	`address` text,
	`city` varchar(100),
	`province` varchar(100),
	`postalCode` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

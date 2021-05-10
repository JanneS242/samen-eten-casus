DROP DATABASE IF EXISTS `studenthome`;
CREATE DATABASE `studenthome`;
USE `studenthome`;

--
-- Uncomment de volgende SQL statements om een user in de database te maken
-- Vanwege security mag je die user alleen in je lokale ontwikkeldatabase aanmaken!
-- Op een remote 'productie'-server moet je zorgen voor een ANDER useraccount!
-- Vanuit je (bv. nodejs) applicatie stel je de credentials daarvan in via environment variabelen.
--
-- studenthome_user aanmaken
CREATE USER 'studenthome_user'@'%' IDENTIFIED BY 'secret';
CREATE USER 'studenthome_user'@'localhost' IDENTIFIED BY 'secret';

-- geef rechten aan deze user
GRANT SELECT, INSERT, DELETE, UPDATE ON `studenthome`.* TO 'studenthome_user'@'%';
GRANT SELECT, INSERT, DELETE, UPDATE ON `studenthome`.* TO 'studenthome_user'@'localhost';

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `user` ;
CREATE TABLE IF NOT EXISTS `user` (
	`ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`First_Name` VARCHAR(32) NOT NULL,
	`Last_Name` VARCHAR(32) NOT NULL,
	`Email` VARCHAR(32) NOT NULL,
	`Student_Number` VARCHAR(32) NOT NULL,
	`Password` CHAR(64) BINARY NOT NULL,
	PRIMARY KEY (`ID`)
) 
ENGINE = InnoDB;

-- Voorbeeld insert query. Wanneer je in Nodejs de ? variant gebruikt hoeven de '' niet om de waarden.
-- Zet die dan wel in het array er na, in de goede volgorde.
-- In je Nodejs app zou het password wel encrypted moeten worden.
INSERT INTO `user` (First_Name, Last_Name, Email, Student_Number, Password) VALUES 
('Jan', 'Smit', 'jsmit@server.nl','222222', 'secret'),
('Mark', 'Rutte', 'mark@rutte.nl', '333333', 'vvddegekste'),
('Dion', 'Koeze', 'dion@koeze.nl', '444444', 'krispijn'),
('Corona', 'Virus', 'covid19@who.nl', '555555', 'walter');

-- -----------------------------------------------------
-- Table `studenthome`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `studenthome` ;
CREATE TABLE IF NOT EXISTS `studenthome` (
	`ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(32) NOT NULL,
	`Address` VARCHAR(32) NOT NULL,
	`House_Nr` INT UNSIGNED NOT NULL,
	`UserID` INT UNSIGNED NOT NULL,
	`Postal_Code` VARCHAR(256) NOT NULL,
	`Telephone` VARCHAR(256) NOT NULL,
	`City` VARCHAR(256) NOT NULL,
	PRIMARY KEY (`ID`)
) 
ENGINE = InnoDB;

ALTER TABLE `studenthome` 
ADD CONSTRAINT `fk_studenthome_user`
FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE;

-- Voorbeeld insert query. Wanneer je in Nodejs de ? variant gebruikt hoeven de '' niet om de waarden.
INSERT INTO `studenthome` (`Name`, `Address`, `House_Nr`, `UserID`, `Postal_Code`, `Telephone`, `City`) VALUES 
('Princenhage', 'Princenhage', 11, 1,'4706RX','061234567891','Breda'),
('Haagdijk 23', 'Haagdijk', 4, 1, '4706RX','061234567891','Breda'),
('Den Hout', 'Lovensdijkstraat', 61, 1, '4706RX','061234567891','Den Hout'),
('Den Dijk', 'Langendijk', 63, 1, '4706RX','061234567891','Breda'),
('Lovensdijk', 'Lovensdijkstraat', 62, 1, '4706RX','061234567891','Breda'),
('Van Schravensteijn', 'Schravensteijnseweg', 23, 1, '4706RX','061234567891','Breda');

-- -----------------------------------------------------
-- Table `meal`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `meal` ;
CREATE TABLE IF NOT EXISTS `meal` (
	`ID` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(32) NOT NULL,
	`Description` VARCHAR(64) NOT NULL,
	`Ingredients` VARCHAR(64) NOT NULL,
	`Allergies` VARCHAR(32) NOT NULL,
	`CreatedOn` DATE NOT NULL,
	`OfferedOn` DATE NOT NULL,
	`Price` INT UNSIGNED  NOT NULL,
	`UserID` INT UNSIGNED NOT NULL,
	`StudenthomeID` INT UNSIGNED NOT NULL,
	`MaxParticipants` INT UNSIGNED NOT NULL,
	PRIMARY KEY (`ID`)
) 
ENGINE = InnoDB;

ALTER TABLE `meal` 
ADD CONSTRAINT `fK_meal_user`
FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE
,
ADD CONSTRAINT `fk_meal_studentenhome`
FOREIGN KEY (`StudenthomeID`) REFERENCES `studenthome` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE
;

-- Voorbeeld insert query.
INSERT INTO `meal` (Name, Description, Ingredients, Allergies, CreatedOn, OfferedOn, Price, UserID, StudenthomeID) VALUES 
('Zuurkool met worst', 'Zuurkool a la Montizaan, specialiteit van het huis.', 'Zuurkool, worst, spekjes', 'Lactose, gluten','2020-09-01','2020-09-01', 5, 1, 1),
('Spaghetti', 'Spaghetti Bolognese', 'Pasta, tomatensaus, gehakt', 'Lactose','2020-09-01','2020-09-01', 3, 1, 1);
-- Voorbeeld delete query
-- DELETE FROM `meal` WHERE `Name` = 'Spaghetti';

-- -----------------------------------------------------
-- Table `participants`
-- Bevat de users die deelnemen aan een meal in een studenthome.
-- 
-- -----------------------------------------------------
DROP TABLE IF EXISTS `participants` ;
CREATE TABLE IF NOT EXISTS `participants` (
	`UserID` INT UNSIGNED NOT NULL,
	`StudenthomeID` INT UNSIGNED NOT NULL,
	`MealID` INT UNSIGNED NOT NULL,
	`SignedUpOn` DATE NOT NULL,
	PRIMARY KEY (`UserID`, `StudenthomeID`, `MealID`)
) 
ENGINE = InnoDB;

ALTER TABLE `participants` 
ADD CONSTRAINT `fk_participants_user`
FOREIGN KEY (`UserID`) REFERENCES `user` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE
,
ADD CONSTRAINT `fk_participants_studentenhome`
FOREIGN KEY (`StudenthomeID`) REFERENCES `studenthome` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE
,
ADD CONSTRAINT `fk_participants_meal`
FOREIGN KEY (`MealID`) REFERENCES `meal` (`ID`)
ON DELETE NO ACTION
ON UPDATE CASCADE
;

-- Voorbeeld insert query.
-- Let op: je kunt je maar 1 keer aanmelden voor een meal in een huis.
-- Je kunt je natuurlijk wel afmelden en opnieuw aanmelden. .
-- INSERT INTO `participants` (UserID, StudenthomeID, MealID) VALUES (1, 1, 1);
-- Voorbeeld van afmelden:
-- DELETE FROM `participants` WHERE UserID = 1 AND StudenthomeID = 1 AND MealID = 1;
-- En opnieuw aanmelden:
-- INSERT INTO `participants` (UserID, StudenthomeID, MealID) VALUES (1, 1, 1);

-- -----------------------------------------------------
-- View om participants bij een meal in een studenthome in te zien.
-- 
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `view_studenthome` AS 
SELECT 
	`studenthome`.`ID`,
	`studenthome`.`Name`,
	`studenthome`.`Address`,
	`studenthome`.`House_Nr`,
	`studenthome`.`Postal_Code`,
	`studenthome`.`Telephone`,
	`studenthome`.`City`,
	CONCAT(`user`.`First_Name`, ' ', `user`.`Last_Name`) AS `Contact`,
	`user`.`Email`,
	`user`.`Student_Number`
FROM `studenthome`
LEFT JOIN `user` ON `studenthome`.`UserID` = `user`.`ID`;

SELECT * FROM `view_studenthome`;

-- -----------------------------------------------------
-- View om participants bij een meal in een studenthome in te zien.
-- 
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `view_participants` AS 
SELECT 
	`participants`.`StudenthomeID`,
	`participants`.`MealID`,
	`user`.`First_Name`,
	`user`.`Last_Name`,
	`user`.`Email`,
	`user`.`Student_Number`
FROM `participants`
LEFT JOIN `user` ON `participants`.`UserID` = `user`.`ID`;

-- Voorbeeldquery.
SELECT * from `view_participants` WHERE StudenthomeID = 1 AND MealID = 1; 

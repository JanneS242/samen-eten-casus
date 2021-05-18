DROP DATABASE IF EXISTS `studenthome`;
CREATE DATABASE `studenthome`;
DROP DATABASE IF EXISTS `studenthome_testdb`;
CREATE DATABASE `studenthome_testdb`;

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
USE `studenthome`;
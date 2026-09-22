-- ============================================================
-- UPDATE AVATAR URLs — Local user upload paths
-- ============================================================

UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Ananya_Sundaram_1084.jpg' WHERE mobile_number = '+91 98401 12345';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Kavitha_Rajendran_3921.jpg' WHERE mobile_number = '+91 98402 23456';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Meenakshi_Natarajan_7814.jpg' WHERE mobile_number = '+91 98403 34567';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Kaviya_Shree_2491.jpg' WHERE mobile_number = '+91 98404 45678';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Divya_Ramachandran_6308.jpg' WHERE mobile_number = '+91 98405 56789';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Soundarya_Saravanan_8524.jpg' WHERE mobile_number = '+91 98406 67890';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Sowmya_Jayaraman_1947.jpg' WHERE mobile_number = '+91 98407 78901';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Nithya_Venkatesan_4639.jpg' WHERE mobile_number = '+91 98408 89012';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Gayathri_Vijayakumar_5712.jpg' WHERE mobile_number = '+91 98409 90123';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Abirami_Murugan_3195.jpg' WHERE mobile_number = '+91 98410 01234';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Bhuvaneshwari_Chandrasekar_9026.jpg' WHERE mobile_number = '+91 98411 12345';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Deepalakshmi_Palanisamy_4183.jpg' WHERE mobile_number = '+91 98412 23456';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Subhasree_Balasubramanian_7260.jpg' WHERE mobile_number = '+91 98413 34567';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Yazhini_Senthilvel_3549.jpg' WHERE mobile_number = '+91 98414 45678';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Keerthana_Muthukrishnan_8172.jpg' WHERE mobile_number = '+91 98415 56789';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Thenmozhi_Arumugam_6403.jpg' WHERE mobile_number = '+91 98416 67890';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Revathi_Karthikeyan_2895.jpg' WHERE mobile_number = '+91 98417 78901';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Sivagami_Meenakshisundaram_5316.jpg' WHERE mobile_number = '+91 98418 89012';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Janani_Padmanabhan_9481.jpg' WHERE mobile_number = '+91 98419 90123';
UPDATE customers SET avatar_url = '/front end/assets/user uploads/user img/Dhanalakshmi_Ganesan_3728.jpg' WHERE mobile_number = '+91 98420 01234';

-- Update design image URLs to local assets
UPDATE designs SET image_url = '/front end/assets/designs/zari-bloom-front.jpg'  WHERE image_url LIKE '%unsplash%' AND garment_type = 'Blouse';
UPDATE designs SET image_url = '/front end/assets/designs/lehenga-stage.png'     WHERE image_url LIKE '%unsplash%' AND garment_type = 'Lehenga';
UPDATE designs SET image_url = '/front end/assets/designs/chudi-stage.png'       WHERE image_url LIKE '%unsplash%' AND garment_type = 'Chudi';
UPDATE designs SET image_url = '/front end/assets/designs/kurti-stage.png'       WHERE image_url LIKE '%unsplash%' AND garment_type = 'Kurti';
UPDATE designs SET image_url = '/front end/assets/designs/saree-stage.png'       WHERE image_url LIKE '%unsplash%' AND garment_type = 'Saree';

-- Catch-all for remaining Unsplash URLs
UPDATE designs SET image_url = '/front end/assets/designs/zari-bloom-front.jpg' WHERE image_url LIKE '%unsplash%';
UPDATE customers SET avatar_url = '/front end/assets/user_avatar.jpg' WHERE avatar_url LIKE '%unsplash%';
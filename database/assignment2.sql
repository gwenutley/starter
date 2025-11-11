--1. Insert into account table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
--2. Modify the record to change the account_type to Admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';
--3. Delete tony stark record
DELETE FROM public.account
WHERE account_firstname = 'Tony';
--4. modify "gm hummer", to "huge interior", 
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
--5. inner join to combine make and model
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM public.inventory AS i
    INNER JOIN public.classification AS c ON c.classification_id = i.classification_id
WHERE c.classification_id = 2;
--6. update all records in inventory to add /vehicles to the file paths
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles');
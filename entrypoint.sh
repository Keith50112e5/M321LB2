#!/bin/bash

# Wait for MariaDB to be ready
while ! nc -z mariadb 3306; do
 echo "Waiting for MariaDB..."
 sleep 1
done

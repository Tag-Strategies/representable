# Generated by Django 2.2 on 2019-04-06 17:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_entry'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='entry',
            table='main_entry',
        ),
    ]
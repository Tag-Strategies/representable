# Generated by Django 2.2 on 2019-04-11 19:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='communityentry',
            name='entry_location',
        ),
    ]

# Generated by Django 2.2 on 2019-04-18 15:32

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20190418_1516'),
    ]

    operations = [
        migrations.AlterField(
            model_name='communityentry',
            name='religion',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('christianity', 'Christianity'), ('buddhism', 'Buddhism'), ('islam', 'Islam'), ('judaism', 'Judaism'), ('hinduism', 'Hinduism'), ('other', 'Other')], max_length=50), blank=True, default=list, size=None),
        ),
    ]
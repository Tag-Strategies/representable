# Generated by Django 2.2.13 on 2020-10-22 16:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0056_auto_20200908_1604"),
    ]

    operations = [
        migrations.AddField(
            model_name="drive",
            name="is_address_required",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="address",
            name="city",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AlterField(
            model_name="address",
            name="state",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AlterField(
            model_name="address",
            name="street",
            field=models.CharField(blank=True, default="", max_length=500),
        ),
        migrations.AlterField(
            model_name="address",
            name="zipcode",
            field=models.CharField(blank=True, default="", max_length=12),
        ),
    ]

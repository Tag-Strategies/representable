# Generated by Django 2.2.13 on 2020-07-31 21:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0048_merge_20200730_2027"),
    ]

    operations = [
        migrations.AlterField(
            model_name="communityentry",
            name="admin_approved",
            field=models.BooleanField(default=True),
        ),
    ]
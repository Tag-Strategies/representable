#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator

# Geo App
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group
from django.db import migrations
from django.contrib.gis.db import models
import datetime
from .choices import (
    POLICY_ISSUES,
    RACE_CHOICES,
    RELIGION_CHOICES,
    INDUSTRY_CHOICES,
)

# ******************************************************************************#


class User(AbstractUser):
    # TODO: Add a language variable for each user
    pass


# ******************************************************************************#


class Tag(models.Model):
    """
    Referenced https://docs.djangoproject.com/en/2.2/topics/forms/modelforms/#a-full-example
    The tag table stores tags associated with different entries.
    """

    name = models.CharField(max_length=100, primary_key=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name


# ******************************************************************************#


class CommunityEntry(models.Model):
    """
    Community Entry represents the entry created by the user when drawing their
    COI.
    Fields included:
     - user: The user that created the entry. Foreign Key = User (Many to One)
     - entry_ID: Randomly Generated via uuid.uuid4.
     - user_polygon:  User polygon contains the polygon drawn by the user.
     - census_blocks_polygon_array: Array containing multiple polygons.
     - census_blocks_polygon: The union of the census block polygons.

     References:
     FK, Many-to-One: https://docs.djangoproject.com/en/2.2/topics/db/examples/many_to_one/

    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    entry_ID = models.CharField(
        max_length=100, blank=False, unique=True, default=uuid.uuid4
    )
    user_polygon = models.PolygonField(
        geography=True, serialize=True, blank=False
    )
    census_blocks_polygon_array = ArrayField(
        models.PolygonField(
            geography=True, blank=True, null=True, serialize=True
        ),
        blank=True,
        null=True,
    )
    census_blocks_polygon = models.MultiPolygonField(
        geography=True, serialize=True, blank=True, null=True
    )
    tags = models.ManyToManyField(Tag, blank=True)
    CHOICES = (
        ("Y", "Yes, this is my community."),
        (
            "N",
            "No, I am creating this community on behalf of another group of people.",
        ),
    )
    entry_name = models.CharField(
        max_length=100, blank=False, unique=False, default="Community_name"
    )
    entry_reason = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    my_community = models.CharField(
        "Is this your community?",
        max_length=1,
        choices=CHOICES,
        default="Y",
        blank=False,
        null=False,
    )
    admin_approved = models.BooleanField(default=False)

    def __str__(self):
        return str(self.entry_ID)

    class Meta:
        db_table = "community_entry"


# ******************************************************************************#


class Issue(models.Model):
    """
    Issue holds issues associated with each community entry.
    Fields included:
        - entry: Foreign Key that associates the issue to the entry.
        - category: Category associated with issue.
        - description: Description.
    """

    entry = models.ForeignKey(
        CommunityEntry, on_delete=models.CASCADE, default=None
    )
    category = models.CharField(
        max_length=50, choices=POLICY_ISSUES, default=None, blank=True
    )
    description = models.CharField(max_length=250, blank=True)

    class Meta:
        ordering = (
            "category",
            "description",
        )

    def __str__(self):
        return self.description


# ******************************************************************************#


class Organization(models.Model):
    """
    Organization represents organizations with a user
    Fields included:
    - name: name of the organization
    - description: description of the organization
    - ext_link: external link to organization website
    - link: relative link for organization page on Representable
    - admin_group: the admins of the group, can moderate and manage
    - mod_group: moderators who have the ability to approve submissions
    """

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=250, blank=True)
    ext_link = models.URLField(max_length=200, blank=True)
    link = models.CharField(
        max_length=100,
        validators=[
            RegexValidator(
                r"^[a-zA-Z0-9-]*$",
                "Enter a valid link with only numbers, letters, and dashes (-).",
            )
        ],
        blank=False,
        unique=True,
    )

    admin_group = models.OneToOneField(
        Group, on_delete=models.CASCADE, related_name="admin_group",
    )
    mod_group = models.OneToOneField(
        Group, on_delete=models.CASCADE, related_name="mod_group",
    )

    class Meta:
        ordering = ("description",)

    def __str__(self):
        return self.name


# ******************************************************************************#

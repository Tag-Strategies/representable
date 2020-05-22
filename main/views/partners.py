from ..models import (
    Membership,
    Organization,
    WhiteListEntry,
    Tag,
    CommunityEntry,
    Campaign,
)

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)

import json
import os
import geojson
from django.shortcuts import get_object_or_404


class IndexView(ListView):
    model = Organization
    template_name = "main/partners/index.html"
    pk_url_kwarg = "pk"


class PartnerView(DetailView):
    model = Organization
    template_name = "main/partners/page.html"
    pk_url_kwarg = "pk"


class WelcomeView(TemplateView):
    model = Organization
    template_name = "main/partners/get_started.html"
    pk_url_kwarg = "pk"


class PartnerMap(TemplateView):
    template_name = "main/partners/map.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # dictionary of entry names and reasons
        entry_names = dict()
        entry_reasons = dict()

        # the polygon coordinates
        entryPolyDict = dict()
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids
        # get the polygon from db and pass it on to html
        if self.kwargs["campaign"]:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"],
                campaign__slug=self.kwargs["campaign"],
                admin_approved=True,
            )
        else:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"], admin_approved=True
            )
        for obj in query:
            if not obj.census_blocks_polygon:
                s = "".join(obj.user_polygon.geojson)
                entry_names[str(obj.entry_ID)] = obj.entry_name
                entry_reasons[str(obj.entry_ID)] = obj.entry_reason
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
                entry_names[str(obj.entry_ID)] = obj.entry_name
                entry_reasons[str(obj.entry_ID)] = obj.entry_reason

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "entry_names": json.dumps(entry_names),
            "entry_reasons": json.dumps(entry_reasons),
            "tags": json.dumps(tags),
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        context["organization"] = Organization.objects.get(
            slug=self.kwargs["slug"]
        )
        if self.kwargs["campaign"]:
            context["campaign"] = get_object_or_404(
                Campaign, slug=self.kwargs["campaign"]
            ).name
        return context

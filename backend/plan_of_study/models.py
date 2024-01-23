from django.db import models

class Class(models.Model) :
    id = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    major = models.CharField(max_length = 50)
    # include number field
    abbreviation = models.CharField(max_length = 50) # can we name this more specifically?
    prereq = models.CharField(max_length = 150, blank = True)
    term = models.CharField(max_length = 50, blank = True)
    coreq = models.CharField(max_length = 150, blank = True)
    description = models.TextField(blank = True)
    credits = models.IntegerField()
    editable_credits = models.BooleanField(default=False)
    elective_field = models.JSONField(default = list)
    elective_field_name = models.CharField(max_length = 50)
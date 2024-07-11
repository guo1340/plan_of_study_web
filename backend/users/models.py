from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from plan.models import Plan


class Details(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(default="regular", max_length=50)
    plans = models.ManyToManyField(Plan)

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def manage_user_details(sender, instance, created, **kwargs):
    if created:
        Details.objects.create(user=instance)
    instance.details.save()

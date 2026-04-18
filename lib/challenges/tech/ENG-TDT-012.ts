import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-012',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'N+1 Query in the ORM',
  companies: ['Shopify', 'HubSpot'],
  timeEst: '~25 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A Django ORM loop fetches each order\'s customer in a separate query. A page with 100 orders fires 101 queries. Add select_related() to fix it.',
  solution: 'Chain .select_related("customer") on the queryset. Django will emit a single JOIN query instead of 100 individual SELECTs.',
  lang: 'Python',
  tribunalData: {
    background: `The Orders dashboard became unusable after the customer count crossed 10,000. A Django Debug Toolbar screenshot shows 101 queries for a single page load.\n\nThe culprit is a classic ORM N+1: the view fetches all orders, then accesses order.customer inside the loop — triggering a lazy DB hit per row.\n\nYour mission: fix the view so it fetches orders and their customers in a single JOIN.`,
    folderPath: 'orders/views',
    primaryFile: 'order_list.py',
    files: [
      {
        name: 'order_list.py',
        lang: 'python',
        code: `from django.shortcuts import render
from .models import Order

# TODO: This fires N+1 queries.
# Each access to order.customer inside the template
# triggers a new SELECT against the customers table.
def order_list(request):
    orders = Order.objects.all().order_by('-created_at')[:100]
    return render(request, 'orders/list.html', {'orders': orders})`,
      },
      {
        name: 'models.py',
        lang: 'python',
        readOnly: true,
        code: `from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)

class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)`,
      },
      {
        name: 'list.html',
        lang: 'html',
        readOnly: true,
        code: `{% for order in orders %}
  <tr>
    <td>{{ order.customer.name }}</td>
    <td>{{ order.total }}</td>
  </tr>
{% endfor %}`,
      },
    ],
    objectives: [
      {
        label: 'Use select_related to JOIN customer in one query',
        check: { type: 'contains', file: 'order_list.py', pattern: 'select_related' },
      },
      {
        label: 'Remove the plain Order.objects.all() without prefetching',
        check: { type: 'not_contains', file: 'order_list.py', pattern: 'objects.all().order_by' },
      },
    ],
    hints: [
      'Django\'s `select_related("customer")` follows ForeignKey relationships and performs a SQL JOIN.',
      'Chain it on the queryset: `Order.objects.select_related("customer").order_by(...)`',
      'For ManyToMany relationships you would use `prefetch_related` instead.',
    ],
    totalTests: 12,
    testFramework: 'pytest-django',
    xp: 200,
    successMessage: `101 queries collapsed into 1. The dashboard now loads in 40ms instead of 2.4s. The Django ORM is powerful — but only if you tell it about relationships.`,
  },
};

export default challenge;

# Skills

This folder stores reusable project skills and agent guidance. These are not
runtime features. They are repeatable review lenses that teammates or AI agents
can use when working on the project.

## Candidate Skills

| Skill | When To Use | Checklist |
| --- | --- | --- |
| Pickleball booking rule review | Before changing holds/bookings/availability | Check overlap, past slots, hold expiry, court status, ownership |
| MySQL overlap query review | Before editing `slot_holds`, `booking_slots`, triggers, or availability SQL | Check transaction safety, indexes, active statuses, time comparisons |
| Express route/controller security review | Before adding protected endpoints | Check auth middleware, role checks, safe errors, input validation |
| React booking-flow UI review | Before changing booking screens | Check hold timer, availability states, disabled actions, mobile layout |
| Payment and refund workflow review | Before changing payment/refund code | Check idempotency, totals, state transitions, audit trail |
| Account and role review | Before changing auth/internal account features | Check role escalation, safe user response, blocked status |
| Notification safety review | Before changing mailer/email logs | Check no secret logging, failure behavior, retry limits |

## How To Use

1. Identify the feature being changed.
2. Pick one or more relevant review skills from the table.
3. Compare the implementation against the related feature spec and constraints.
4. Record findings in `.sdd/reviews/` when the review changes a decision or
   exposes a gap.

# Histogram and cumulative-frequency pilot

Open [Build a grouped-data report](review/histograms.html). The source, model, drawing and CSS are named `src/histograms*`; [the pilot configuration](src/histograms.pilot.json) specifies the gates and limitations. This is the sixth review lab, not a production replacement.

## Why this model

The [original lab](../../labs-src/mathematics/histogram-area-cumulative-distribution/lab.html) already connects unequal-width bars, cumulative totals and quartile read-offs. It is suitable for replication because the learner can make a plausible but wrong construction: equal heights for equal frequencies when widths differ. The reimagining retains the original relationship, invariants and non-goals, verified against the [source contract](../../lab-contracts/mathematics/histogram-area-cumulative-distribution.lab.json).

The [straight-line pilot](STRAIGHT-LINES-PILOT.md) contributes the stable shell and consequential prediction comparison, not a new page recipe. The new SVG uses the same semantic quantity links, work region, primary action and optional hints. The shared restart cleanup applies to all six labs.

## Progression

1. Change one same-width bar to represent twice the reference frequency. Filled area cells are visible before the formula.
2. Give two unequal-width intervals the same frequency. Equal starting heights deliberately give unequal areas.
3. Build four bars in any order. Matching the overall count without matching each group is insufficient.
4. Construct cumulative totals using three movable crosses. The sketch cannot decrease; after Check the actual report line supplies comparison evidence.
5. Move a ruler through the linked plots, record Q1, median and Q3, then calculate the interquartile range. A wrong range draws a bracket that misses the recorded upper quartile.
6. In the ungated experiment, alter group frequencies, save a report and compare the resulting bar areas, total and median.

The guided report has frequencies 10, 20, 20 and 10 over widths 10, 10, 20 and 20 minutes. Its cumulative totals are 0, 10, 30, 50 and 60. Piecewise-linear read-offs give Q1 ≈ 12.5 min, median ≈ 20 min and Q3 ≈ 35 min. These are estimates under the stated within-class assumption, not exact raw pupil times.

## Deliberate boundaries

Straight cumulative segments integrate the constant density of each histogram bar. This differs from the original smooth interpolation and is labelled in the lab. Cells encode five pupils of area; they are not individual observations. The data are a fixed synthetic teaching report. No random cases, inferred raw data, probability-density normalisation, significance testing or new statistics curriculum is added.

Mouse dragging, keyboard adjustment and non-drag taps use the same setters. The learner's cumulative proposal is separate from actual frequencies. Editing clears the previous check. Saved reports copy their arrays and do not change when a live bar changes. With no pupils, quartiles are undefined rather than zero.

## What to inspect

The second step should make the need for area apparent without giving the required height away. The third should reject a report with the correct total but incorrect groups. In the cumulative step, a group frequency used as a total must produce a visible mismatch. In the quartile step, revise a recorded reading after success: the dependent range must become pending again. On mobile, the same aligned intervals must remain readable and the controls must stay attached to their bars or ruler.

See [workflow and primary sources](WORKFLOW-AND-DESIGN.md) for the teaching, interface and accessibility rationale. The attached book's later statistics pages were unavailable; no textbook quotation is claimed. See [verification notes](VERIFICATION.md) for the actual test record and its limitations.

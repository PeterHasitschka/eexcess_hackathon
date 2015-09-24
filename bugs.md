WEBGL-VIS
=========


Aktuelle Bugs
-------------

### 24.09.15

* **Rec-Click bei gedrehter Collection**
    * Position wird falsch berechnet. Fokussiert aktuell auf Collection center.
    * Offensichtlich wird die lokale Transformation bei `updateMatrixWorld()` nicht miteinbezogen. 
    * Besser als vorher nach `matrixWorldNeedsUpdate` flag `und updateMatrixWorld()` auf rec-circle-mesh.


* **Rec-Detail-Node aktiviert, dann Klick auf Collection-Center-Node**
    * Switcht nicht zu Rec-Common-Node

# Button

`custom:ui-button` · Layer: components · Status: Draft

Purpose: a generic chip or tile for a switch, light, scene, script or `input_boolean`, built only from the shared primitives.

```yaml
type: custom:ui-button
entity: scene.movie
name: Movie
icon: scene          # an interface icon name (Content > Art)
size: auto           # auto | chip | tile
```

- `auto` = chip under 150 px of its own width, tile from 150 px.
- Scenes and scripts: tap runs (`turn_on`); others toggle.
- Refuses lock, cover, climate, alarm and media_player entities with a config error (logic `buttonAction`, tested).

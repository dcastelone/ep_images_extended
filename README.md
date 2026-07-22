# ep_images_extended

Inline image editing for Etherpad with embedded, local, or direct-to-S3 storage. Images can share a line with text and can be resized, floated, copied, cut, or removed through an accessible formatting interface.

![Inline image editing in Etherpad](https://i.imgur.com/qGOBRep.png)

## Features

- Inline images alongside ordinary Etherpad text
- Drag resizing and left, right, or inline placement
- Keyboard-accessible image formatting and optional alt text
- Base64, local-disk, and S3 presigned-upload storage
- Private CloudFront delivery through parent-issued signed cookies
- Timeslider rendering without rewriting historical image attributes

## Installation

From the Etherpad directory:

```sh
pnpm run plugins i ep_images_extended
```

Restart Etherpad after installation. This release supports Etherpad 3.3.2 and later 3.x releases.

## Configuration

Add an `ep_images_extended` object to `settings.json`.

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `fileTypes` | string array | Any `image/*` MIME type | Allowed filename extensions without dots |
| `maxFileSize` | number | Storage-dependent | Maximum upload size in bytes |
| `storage` | object | `{ "type": "base64" }` | Image storage strategy |
| `delivery` | object | `{ "mode": "public" }` | Viewer delivery behavior |

### Embedded base64

```json
{
  "ep_images_extended": {
    "storage": {"type": "base64"},
    "fileTypes": ["jpeg", "jpg", "png", "gif", "webp"],
    "maxFileSize": 5000000
  }
}
```

Base64 images are stored in the pad. This is convenient for small deployments but increases pad and revision size.

### S3 presigned uploads

```json
{
  "ep_images_extended": {
    "storage": {
      "type": "s3_presigned",
      "region": "us-east-1",
      "bucket": "example-images",
      "publicURL": "https://files.example.org/images/",
      "expires": 900
    },
    "fileTypes": ["png", "jpg", "jpeg", "webp"],
    "maxFileSize": 10485760
  }
}
```

The browser uploads directly to S3 with a short-lived PUT URL. The AWS SDK uses its normal credential provider chain; on AWS, prefer a task role over long-lived access keys. Configure bucket CORS to permit PUT requests from the Etherpad origin.

### Local disk

```json
{
  "ep_images_extended": {
    "storage": {
      "type": "local",
      "baseFolder": "static/images",
      "baseURL": "https://pads.example.org/static/images/"
    }
  }
}
```

Local storage must be persistent and shared appropriately for multi-instance Etherpad deployments.

## Private CloudFront delivery

```json
{
  "ep_images_extended": {
    "storage": {
      "type": "s3_presigned",
      "region": "us-east-1",
      "bucket": "example-private-images",
      "publicURL": "https://files.example.org/images/",
      "expires": 900
    },
    "delivery": {
      "mode": "signed_cookie",
      "legacyBaseURLs": ["https://legacy.example.cloudfront.net/"]
    }
  }
}
```

The authenticated parent application must issue valid CloudFront cookies before Etherpad loads. This plugin never receives the CloudFront private key. New images retain stable branded URLs. Explicitly allowlisted legacy URLs are mapped to the branded base only while rendering; stored pad attributes and revision history remain unchanged.

## Export support

This plugin does not register specialized export hooks. Image attributes remain available to normal content collection and the timeslider, but HTML or document-export rendering is outside the supported surface.

## Development

```sh
pnpm install --frozen-lockfile
pnpm test
```

The plugin began as a substantial rewrite of `ep_image_insert`. See `NOTICE.md` for attribution and `LICENSE.md` for the Apache License 2.0 terms.

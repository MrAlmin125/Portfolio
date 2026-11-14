/**
 * ==============================================================
 * Visitor / Page View Tracker
 * ==============================================================
 *
 * Add to any page:
 *
 * <script src="js/track.js"></script>
 *
 * Sends visitor information to:
 *
 *     api/track.php
 *
 * Detects:
 * - Visitor ID
 * - Page
 * - Referrer
 * - Language
 * - Timezone
 * - Brave
 * - Facebook
 * - Messenger
 * - Instagram
 * - TikTok
 * - WhatsApp
 * - Xiaomi Browser
 * - Samsung Internet
 * - Browser
 * - Browser version
 * - Device model
 * - Platform
 * - OS hints
 * - Screen size
 * - Viewport
 * - DPR
 * - Touch
 * - CPU
 * - Device memory
 * - Network information
 * - User-Agent
 * - User-Agent Client Hints
 */

(function () {

  "use strict";


  // ============================================================
  // VISITOR ID
  // ============================================================

  function getVisitorId() {

    try {

      let id = localStorage.getItem("amin-visitor-id");

      if (!id) {

        id =
          (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : (
                "v-" +
                Date.now() +
                "-" +
                Math.random()
                  .toString(36)
                  .slice(2)
              );

        localStorage.setItem(
          "amin-visitor-id",
          id
        );
      }

      return id;

    } catch (e) {

      return (
        "v-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2)
      );
    }
  }


  // ============================================================
  // SAFE VALUE
  // ============================================================

  function safe(value, fallback = "") {

    return (
      value === undefined ||
      value === null
    )
      ? fallback
      : value;
  }


  // ============================================================
  // TIMEZONE
  // ============================================================

  function getTimezone() {

    try {

      return (
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone || ""
      );

    } catch (e) {

      return "";
    }
  }


  // ============================================================
  // BRAVE DETECTION
  // ============================================================

  function checkBrave() {

    try {

      if (
        navigator.brave &&
        typeof navigator.brave.isBrave === "function"
      ) {

        return navigator.brave
          .isBrave()
          .then(function (result) {
            return !!result;
          })
          .catch(function () {
            return false;
          });
      }

    } catch (e) {}

    return Promise.resolve(false);
  }


  // ============================================================
  // USER AGENT CLIENT HINTS
  // ============================================================

  function getClientHints() {

    if (
      !navigator.userAgentData ||
      typeof navigator.userAgentData
        .getHighEntropyValues !== "function"
    ) {

      return Promise.resolve({});
    }


    return navigator.userAgentData
      .getHighEntropyValues([

        "architecture",
        "bitness",
        "formFactors",
        "model",
        "platform",
        "platformVersion",
        "fullVersionList",
        "wow64"

      ])
      .then(function (data) {

        return {

          mobile:
            safe(
              navigator.userAgentData.mobile,
              false
            ),

          platform:
            safe(data.platform),

          platformVersion:
            safe(data.platformVersion),

          architecture:
            safe(data.architecture),

          bitness:
            safe(data.bitness),

          model:
            safe(data.model),

          formFactors:
            safe(data.formFactors, []),

          fullVersionList:
            safe(data.fullVersionList, []),

          wow64:
            safe(data.wow64, false),

          brands:
            safe(
              navigator.userAgentData.brands,
              []
            )

        };

      })
      .catch(function () {

        return {};

      });
  }


  // ============================================================
  // CONNECTION INFORMATION
  // ============================================================

  function getConnection() {

    try {

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (!connection) {
        return {};
      }

      return {

        type:
          safe(connection.effectiveType),

        downlink:
          safe(connection.downlink),

        rtt:
          safe(connection.rtt),

        saveData:
          !!connection.saveData

      };

    } catch (e) {

      return {};
    }
  }


  // ============================================================
  // SCREEN
  // ============================================================

  function getScreenInfo() {

    return {

      screen_width:
        safe(screen.width, 0),

      screen_height:
        safe(screen.height, 0),

      avail_width:
        safe(screen.availWidth, 0),

      avail_height:
        safe(screen.availHeight, 0),

      viewport_width:
        safe(window.innerWidth, 0),

      viewport_height:
        safe(window.innerHeight, 0),

      device_pixel_ratio:
        safe(window.devicePixelRatio, 1),

      color_depth:
        safe(screen.colorDepth, 0),

      pixel_depth:
        safe(screen.pixelDepth, 0)

    };
  }


  // ============================================================
  // DEVICE
  // ============================================================

  function getDeviceInfo() {

    return {

      user_agent:
        safe(navigator.userAgent),

      platform:
        safe(navigator.platform),

      vendor:
        safe(navigator.vendor),

      language:
        safe(navigator.language),

      languages:
        safe(navigator.languages, []),

      hardware_concurrency:
        safe(
          navigator.hardwareConcurrency,
          0
        ),

      device_memory:
        safe(
          navigator.deviceMemory,
          0
        ),

      touch_points:
        safe(
          navigator.maxTouchPoints,
          0
        ),

      touch:
        (
          "ontouchstart" in window ||
          (navigator.maxTouchPoints || 0) > 0
        ),

      cookies:
        !!navigator.cookieEnabled,

      online:
        !!navigator.onLine,

      do_not_track:
        safe(navigator.doNotTrack)

    };
  }


  // ============================================================
  // BUILD PAYLOAD
  // ============================================================

  function buildPayload(isBrave, hints) {

    const device =
      getDeviceInfo();

    const screenInfo =
      getScreenInfo();

    const connection =
      getConnection();


    return {

      // --------------------------------------------------------
      // Existing database fields
      // --------------------------------------------------------

      visitor_id:
        getVisitorId(),

      page:
        location.pathname +
        location.hash,

      page_url:
        location.href,

      referrer:
        document.referrer || "",

      lang:
        navigator.language || "",

      visitor_tz:
        getTimezone(),


      // --------------------------------------------------------
      // Browser
      // --------------------------------------------------------

      browser_override:
        isBrave
          ? "Brave"
          : "",

      browser_brands:
        hints.brands || [],

      browser_full_versions:
        hints.fullVersionList || [],


      // --------------------------------------------------------
      // Device
      // --------------------------------------------------------

      model_override:
        hints.model || "",

      device_type:
        hints.mobile
          ? "Mobile"
          : "",


      // --------------------------------------------------------
      // OS / Platform
      // --------------------------------------------------------

      platform:
        hints.platform ||
        device.platform ||
        "",

      platform_version:
        hints.platformVersion ||
        "",


      // --------------------------------------------------------
      // CPU
      // --------------------------------------------------------

      architecture:
        hints.architecture ||
        "",

      bitness:
        hints.bitness ||
        "",


      // --------------------------------------------------------
      // Screen
      // --------------------------------------------------------

      screen_width:
        screenInfo.screen_width,

      screen_height:
        screenInfo.screen_height,

      viewport_width:
        screenInfo.viewport_width,

      viewport_height:
        screenInfo.viewport_height,

      device_pixel_ratio:
        screenInfo.device_pixel_ratio,

      color_depth:
        screenInfo.color_depth,

      pixel_depth:
        screenInfo.pixel_depth,


      // --------------------------------------------------------
      // Touch
      // --------------------------------------------------------

      touch:
        device.touch,

      touch_points:
        device.touch_points,


      // --------------------------------------------------------
      // Hardware
      // --------------------------------------------------------

      hardware_concurrency:
        device.hardware_concurrency,

      device_memory:
        device.device_memory,


      // --------------------------------------------------------
      // Connection
      // --------------------------------------------------------

      connection_type:
        connection.type || "",

      downlink:
        connection.downlink || null,

      rtt:
        connection.rtt || null,


      // --------------------------------------------------------
      // Browser information
      // --------------------------------------------------------

      user_agent:
        device.user_agent,

      vendor:
        device.vendor,


      // --------------------------------------------------------
      // Other
      // --------------------------------------------------------

      cookies_enabled:
        device.cookies,

      online:
        device.online,

      do_not_track:
        device.do_not_track || "",

      ua_mobile:
        hints.mobile || false,

      form_factors:
        hints.formFactors || [],

      wow64:
        hints.wow64 || false

    };
  }


  // ============================================================
  // SEND TO PHP
  // ============================================================

  function sendToServer(payload) {

    const json =
      JSON.stringify(payload);


    // ----------------------------------------------------------
    // sendBeacon
    // ----------------------------------------------------------

    if (navigator.sendBeacon) {

      try {

        const blob = new Blob(
          [json],
          {
            type:
              "application/json"
          }
        );

        const sent =
          navigator.sendBeacon(
            "api/track.php",
            blob
          );

        if (sent) {
          return;
        }

      } catch (e) {}
    }


    // ----------------------------------------------------------
    // Fetch fallback
    // ----------------------------------------------------------

    try {

      fetch(
        "api/track.php",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: json,

          keepalive: true

        }
      ).catch(function () {});

    } catch (e) {}
  }


  // ============================================================
  // TRACK
  // ============================================================

  function trackPageView() {

    try {

      Promise.all([

        checkBrave(),

        getClientHints()

      ]).then(function (result) {

        const isBrave =
          result[0];

        const hints =
          result[1];


        const payload =
          buildPayload(
            isBrave,
            hints
          );


        sendToServer(payload);

      });

    } catch (e) {

      // Never break the website
    }
  }


  // ============================================================
  // START
  // ============================================================

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      trackPageView
    );

  } else {

    trackPageView();

  }

})();
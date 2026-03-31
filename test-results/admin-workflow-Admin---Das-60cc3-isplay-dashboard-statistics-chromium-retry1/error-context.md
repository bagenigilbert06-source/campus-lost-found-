# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e7]
  - generic [ref=e71]:
    - generic [ref=e72]:
      - generic [ref=e73]: 🔐
      - heading "Lost & Found Office" [level=1] [ref=e74]
    - paragraph [ref=e75]: Security Staff Portal
    - button "Sign in with Google" [ref=e76] [cursor=pointer]:
      - img [ref=e77]
      - text: Sign in with Google
    - generic [ref=e82]: OR
    - generic [ref=e83]:
      - generic [ref=e84]:
        - generic [ref=e85]: Office Email
        - textbox "admin@zetech.ac.ke" [ref=e86]
      - generic [ref=e87]:
        - generic [ref=e88]: Password
        - generic [ref=e89]:
          - textbox "Enter your password" [ref=e90]
          - button [ref=e91] [cursor=pointer]:
            - img [ref=e92]
      - button "Sign In" [ref=e94] [cursor=pointer]
    - generic [ref=e95]:
      - paragraph [ref=e96]: Admin Access Only
      - paragraph [ref=e97]: This portal is restricted to authorized security staff only. Unauthorized access will be logged and reported.
    - paragraph [ref=e98]:
      - text: Not an admin?
      - link "Student Login" [ref=e99] [cursor=pointer]:
        - /url: /signin
```
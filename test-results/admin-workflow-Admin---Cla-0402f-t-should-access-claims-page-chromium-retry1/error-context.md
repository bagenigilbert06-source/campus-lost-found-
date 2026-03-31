# Page snapshot

```yaml
- generic [ref=e3]:
  - status [ref=e9]: Too many failed attempts. Try again later.
  - generic [ref=e10]:
    - img [ref=e13]
    - generic [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]: 🔐
        - heading "Lost & Found Office" [level=1] [ref=e80]
      - paragraph [ref=e81]: Security Staff Portal
      - button "Sign in with Google" [ref=e82] [cursor=pointer]:
        - img [ref=e83]
        - text: Sign in with Google
      - generic [ref=e88]: OR
      - generic [ref=e89]:
        - generic [ref=e90]:
          - generic [ref=e91]: Office Email
          - textbox "admin@zetech.ac.ke" [ref=e92]
        - generic [ref=e93]:
          - generic [ref=e94]: Password
          - generic [ref=e95]:
            - textbox "Enter your password" [ref=e96]
            - button [ref=e97] [cursor=pointer]:
              - img [ref=e98]
        - button "Sign In" [ref=e100] [cursor=pointer]
      - generic [ref=e101]:
        - paragraph [ref=e102]: Admin Access Only
        - paragraph [ref=e103]: This portal is restricted to authorized security staff only. Unauthorized access will be logged and reported.
      - paragraph [ref=e104]:
        - text: Not an admin?
        - link "Student Login" [ref=e105] [cursor=pointer]:
          - /url: /signin
```